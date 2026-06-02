// ============================================================
// IPL real-data extractor
// One-time build step: parses the 105MB ball-by-ball IPL.csv and emits
// compact data modules the React app imports. Run with:  npm run extract:ipl
//
// Outputs (src/data/):
//   realPlayerStats.js  career batSR/batAvg/bowlSR/bowlEcon per real player
//   iplAggregates.js    phase splits, extras, dismissal mix, venues, toss, H2H
//   iplRecords.js       leaderboards for the Records UI
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Pull ROSTERS straight from the source (the tuples are pure literals).
// Avoids Node's extension-less ESM import limitation against src/data.js.
const dataSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'data.js'), 'utf8');
const rostersMatch = dataSrc.match(/export const ROSTERS = (\{[\s\S]*?\n\});/);
if (!rostersMatch) throw new Error('Could not locate ROSTERS literal in src/data.js');
const ROSTERS = eval('(' + rostersMatch[1] + ')');
const CSV = process.env.IPL_CSV || 'C:/Users/sutta/Downloads/IPL.csv';
const OUT = path.join(__dirname, '..', 'src', 'data');

// ---- minimal quote-aware CSV line parser ----
function parseLine(line) {
  const r = []; let c = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') q = !q;
    else if (ch === ',' && !q) { r.push(c); c = ''; }
    else c += ch;
  }
  r.push(c);
  return r;
}

console.log('Reading', CSV, '…');
const text = fs.readFileSync(CSV, 'utf8');
const lines = text.split('\n');
const H = parseLine(lines[0]);
const ix = {}; H.forEach((h, i) => ix[h] = i);
const need = ['match_id','innings','batting_team','bowling_team','over','batter','bowler',
  'runs_batter','runs_bowler','runs_total','balls_faced','valid_ball','extra_type',
  'wicket_kind','player_out','bowler_wicket','batter_runs','team_runs',
  'toss_winner','toss_decision','match_won_by','player_of_match','venue','city','season','win_outcome','match_won_by'];
for (const n of need) if (!(n in ix)) throw new Error('missing column: ' + n);

// ---- accumulators ----
const bat = {};   // name -> { runs, balls, outs, fours, sixes }
const bowl = {};  // name -> { balls, runs, wkts }
const inningsScore = {}; // matchId|inn|batter -> max batter_runs (their score that innings)
const teamInnTotal = {}; // matchId|inn -> { runs, team, opp, venue, season }
const phase = { pp: ball0(), mid: ball0(), death: ball0() }; // league-wide
const runDist = { pp: rd0(), mid: rd0(), death: rd0() };      // off-bat run distribution per phase
function rd0() { return { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 6: 0, balls: 0 }; }
const extras = { wides: 0, noballs: 0, byes: 0, legbyes: 0, total: 0, legalBalls: 0 };
const dismiss = {}; // wicket_kind -> count
const venues = {};  // venue -> { runs, legalBalls, inn1Totals:[] }
const potm = {};    // player -> awards
const tossDec = { field: 0, bat: 0 };
let tossWinIsMatchWin = 0, tossDecided = 0;
const matchMeta = {}; // matchId -> { teams:Set, winner, toss_winner, potm, venue, season }
function ball0() { return { runs: 0, balls: 0, wkts: 0 }; }

// team-name normalization to current 10 franchise IDs (renamed franchises merged)
const TEAM_ID = {
  'Chennai Super Kings':'CSK', 'Mumbai Indians':'MI',
  'Royal Challengers Bangalore':'RCB', 'Royal Challengers Bengaluru':'RCB',
  'Kolkata Knight Riders':'KKR', 'Sunrisers Hyderabad':'SRH',
  'Delhi Daredevils':'DC', 'Delhi Capitals':'DC',
  'Rajasthan Royals':'RR', 'Kings XI Punjab':'PBKS', 'Punjab Kings':'PBKS',
  'Gujarat Titans':'GT', 'Lucknow Super Giants':'LSG',
  // defunct / non-current franchises are intentionally left unmapped (skipped in H2H)
};

console.log('Parsing', (lines.length - 1).toLocaleString(), 'rows …');
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line || !line.trim()) continue;
  const v = parseLine(line);

  const mid = v[ix.match_id];
  const inn = v[ix.innings];
  const over = +v[ix.over];
  const batter = v[ix.batter];
  const bowler = v[ix.bowler];
  const rb = +v[ix.runs_batter] || 0;
  const rbow = +v[ix.runs_bowler] || 0;
  const rtot = +v[ix.runs_total] || 0;
  const bf = +v[ix.balls_faced] || 0;
  const legal = v[ix.valid_ball] === '1';
  const et = v[ix.extra_type];
  const wk = v[ix.wicket_kind];
  const out = v[ix.player_out];
  const bowlerWk = v[ix.bowler_wicket] === '1';
  const venue = v[ix.venue];
  const season = v[ix.season];

  // ---- batting ----
  if (batter) {
    const b = bat[batter] || (bat[batter] = { runs: 0, balls: 0, outs: 0, fours: 0, sixes: 0 });
    b.runs += rb;
    b.balls += bf;          // balls faced (incl. noballs, excl. wides)
    if (rb === 4) b.fours++;
    if (rb === 6) b.sixes++;
    // per-innings high score tracking via running batter_runs
    const k = mid + '|' + inn + '|' + batter;
    const br = +v[ix.batter_runs] || 0;
    if (!(k in inningsScore) || br > inningsScore[k]) inningsScore[k] = br;
  }
  if (out && (bat[out] || (bat[out] = { runs: 0, balls: 0, outs: 0, fours: 0, sixes: 0 }))) {
    bat[out].outs++;
  }

  // ---- bowling ----
  if (bowler) {
    const bw = bowl[bowler] || (bowl[bowler] = { balls: 0, runs: 0, wkts: 0 });
    if (legal) bw.balls++;
    bw.runs += rbow;
    if (bowlerWk) bw.wkts++;
  }

  // ---- only innings 1 & 2 count toward T20 phase/team/venue context ----
  const isMainInn = inn === '1' || inn === '2';

  // team innings total (running team_runs max)
  if (isMainInn) {
    const tk = mid + '|' + inn;
    const tr = +v[ix.team_runs] || 0;
    if (!teamInnTotal[tk]) teamInnTotal[tk] = { runs: 0, team: v[ix.batting_team], opp: v[ix.bowling_team], venue, season };
    if (tr > teamInnTotal[tk].runs) teamInnTotal[tk].runs = tr;
  }

  // ---- phase splits (league-wide, main innings only) ----
  if (isMainInn) {
    const ph = over < 6 ? phase.pp : over < 15 ? phase.mid : phase.death;
    ph.runs += rtot;
    if (legal) ph.balls++;
    if (wk) ph.wkts++;
    // off-bat run distribution on surviving (non-wicket) legal balls — the engine
    // rolls dismissals separately, so this is "runs given the batter survived".
    if (legal && !wk) {
      const rd = over < 6 ? runDist.pp : over < 15 ? runDist.mid : runDist.death;
      const key = (rb === 0 || rb === 1 || rb === 2 || rb === 3 || rb === 4 || rb === 6) ? rb : (rb === 5 ? 4 : 0);
      rd[key]++; rd.balls++;
    }
  }

  // ---- extras ----
  if (isMainInn) {
    if (legal) extras.legalBalls++;
    if (et) {
      extras.total += (rtot - rb);
      if (et.includes('wides')) extras.wides++;
      if (et.includes('noballs')) extras.noballs++;
      if (et.includes('legbyes')) extras.legbyes++;
      else if (et.includes('byes')) extras.byes++;
    }
  }

  // ---- dismissals ----
  if (wk) dismiss[wk] = (dismiss[wk] || 0) + 1;

  // ---- venues ----
  if (isMainInn && venue) {
    const vv = venues[venue] || (venues[venue] = { runs: 0, legalBalls: 0, inn1: [] });
    vv.runs += rtot;
    if (legal) vv.legalBalls++;
  }

  // ---- match meta (first time we see the match) ----
  let mm = matchMeta[mid];
  if (!mm) {
    mm = matchMeta[mid] = {
      teams: new Set(), winner: v[ix.match_won_by], tossWinner: v[ix.toss_winner],
      tossDec: v[ix.toss_decision], potm: v[ix.player_of_match], venue, season,
    };
  }
  mm.teams.add(v[ix.batting_team]);
  mm.teams.add(v[ix.bowling_team]);
}

// ---- per-innings scores -> HS / 50s / 100s ----
const hs = {}, fifties = {}, hundreds = {}, inningsPlayed = {};
for (const k in inningsScore) {
  const name = k.split('|')[2];
  const s = inningsScore[k];
  inningsPlayed[name] = (inningsPlayed[name] || 0) + 1;
  if (!(name in hs) || s > hs[name]) hs[name] = s;
  if (s >= 100) hundreds[name] = (hundreds[name] || 0) + 1;
  else if (s >= 50) fifties[name] = (fifties[name] || 0) + 1;
}

// ---- team innings totals -> highest totals + venue inn1 ----
const teamTotals = Object.entries(teamInnTotal)
  .map(([k, t]) => ({ inn: k.split('|')[1], ...t }))
  .filter(t => t.runs > 0);
const highestTotals = [...teamTotals].sort((a, b) => b.runs - a.runs).slice(0, 12);

// ---- match-level toss/POTM/H2H ----
const h2h = {}; // A -> B -> wins
for (const mid in matchMeta) {
  const m = matchMeta[mid];
  if (m.potm) potm[m.potm] = (potm[m.potm] || 0) + 1;
  if (m.tossDec === 'field') tossDec.field++;
  else if (m.tossDec === 'bat') tossDec.bat++;
  if (m.tossWinner && m.winner && m.winner !== 'NA') {
    tossDecided++;
    if (m.tossWinner === m.winner) tossWinIsMatchWin++;
  }
  // H2H among current franchises
  const ids = [...m.teams].map(t => TEAM_ID[t]).filter(Boolean);
  const uniq = [...new Set(ids)];
  if (uniq.length === 2 && m.winner && TEAM_ID[m.winner]) {
    const w = TEAM_ID[m.winner];
    const [a, b] = uniq;
    h2h[a] = h2h[a] || {}; h2h[b] = h2h[b] || {};
    h2h[a][b] = h2h[a][b] || { w: 0, l: 0 };
    h2h[b][a] = h2h[b][a] || { w: 0, l: 0 };
    if (w === a) { h2h[a][b].w++; h2h[b][a].l++; }
    else if (w === b) { h2h[b][a].w++; h2h[a][b].l++; }
  }
}

// ============================================================
// PLAYER STAT RESOLUTION (roster name -> CSV stats)
// ============================================================
const PARTICLES = new Set(['du', 'de', 'van', 'der', 'la', 'le', 'da']);
function splitName(full) {
  const toks = full.trim().split(/\s+/);
  // merge surname particles: "Faf du Plessis" -> first=[Faf] surname="du Plessis"
  let si = toks.length - 1;
  while (si - 1 >= 1 && PARTICLES.has(toks[si - 1].toLowerCase())) si--;
  const surname = toks.slice(si).join(' ');
  const first = toks.slice(0, si);
  return { first, surname };
}
function firstInitial(full) {
  const { first } = splitName(full);
  if (!first.length) return '';
  return first[0][0].toUpperCase();
}
// explicit overrides where heuristic is ambiguous/wrong (rosterName -> csvName)
const OVERRIDES = {
  'Dinesh Karthik': 'KD Karthik',
  'Mustafizur Rahman': 'Mustafizur Rahman',
  'Matheesha Pathirana': 'M Pathirana',
  'Wriddhiman Saha': 'WP Saha',
  'Quinton de Kock': 'Q de Kock',
  'Nicholas Pooran': 'N Pooran',
  'Kagiso Rabada': 'K Rabada',
  'Sai Sudharsan': 'B Sai Sudharsan',
  'R Sai Kishore': 'R Sai Kishore',
  'Naveen-ul-Haq': 'Naveen-ul-Haq',
  'Mohammed Siraj': 'Mohammed Siraj',
  'Mohammed Shami': 'Mohammed Shami',
  'Mohsin Khan': 'Mohsin Khan',
  'Abhishek Sharma': 'Abhishek Sharma',
  'Ashutosh Sharma': 'Ashutosh Sharma',
  'Shahbaz Ahmed': 'Shahbaz Ahmed',
};

const batNames = Object.keys(bat);
const bowlNames = Object.keys(bowl);
function findCsvName(rosterName, pool, statObj, minActivity) {
  if (OVERRIDES[rosterName] && statObj[OVERRIDES[rosterName]]) return OVERRIDES[rosterName];
  if (statObj[rosterName]) return rosterName; // exact (e.g. "MS Dhoni" already)
  const { surname } = splitName(rosterName);
  const fi = firstInitial(rosterName);
  const sl = surname.toLowerCase();
  // candidates: CSV name endswith surname AND initials start with first-initial
  const cands = pool.filter(n => {
    const cs = splitName(n);
    if (cs.surname.toLowerCase() !== sl) return false;
    const cf = cs.first.length ? cs.first[0][0].toUpperCase() : '';
    return cf === fi;
  });
  if (!cands.length) return null;
  // pick most active
  const act = (n) => statObj[n] ? (statObj[n].balls || statObj[n].balls === 0 ? (statObj[n].balls) : 0) : 0;
  cands.sort((a, b) => act(b) - act(a));
  return cands[0];
}

const MIN_BAT_BALLS = 150;   // below this, keep hand-tuned fallback
const MIN_BOWL_BALLS = 120;

function batRatings(name) {
  const b = bat[name]; if (!b || b.balls < MIN_BAT_BALLS) return null;
  const sr = (b.runs / b.balls) * 100;
  const avg = b.outs > 0 ? b.runs / b.outs : b.runs; // not-out career edge case
  return { batSR: round1(sr), batAvg: round1(avg), _balls: b.balls };
}
function bowlRatings(name) {
  const b = bowl[name]; if (!b || b.balls < MIN_BOWL_BALLS || b.wkts === 0) return null;
  const econ = (b.runs / b.balls) * 6;
  const bsr = b.balls / b.wkts;
  return { bowlSR: round1(bsr), bowlEcon: round1(econ), _balls: b.balls };
}
function round1(x) { return Math.round(x * 10) / 10; }

// resolve every rostered player
const resolved = {};       // "TEAM:Name" -> { batSR?, batAvg?, bowlSR?, bowlEcon? }
const report = { batched: [], batFallback: [], bowlMatched: [], bowlFallback: [], unmatched: [] };
for (const teamId in ROSTERS) {
  for (const tup of ROSTERS[teamId]) {
    const [name, role, hsSR, hsAVG, hsBSR, hsECON] = tup;
    const key = `${teamId}:${name}`;
    const out = {};
    // batting
    const csvBat = findCsvName(name, batNames, bat, MIN_BAT_BALLS);
    const br = csvBat ? batRatings(csvBat) : null;
    if (br) { out.batSR = br.batSR; out.batAvg = br.batAvg; report.batched.push(`${name} -> ${csvBat} (SR ${br.batSR}, AVG ${br.batAvg}, ${br._balls}b)`); }
    else report.batFallback.push(`${name} (kept ${hsSR}/${hsAVG})`);
    // bowling (only if roster says they bowl)
    if (hsBSR !== null) {
      const csvBowl = findCsvName(name, bowlNames, bowl, MIN_BOWL_BALLS);
      const wr = csvBowl ? bowlRatings(csvBowl) : null;
      if (wr) { out.bowlSR = wr.bowlSR; out.bowlEcon = wr.bowlEcon; report.bowlMatched.push(`${name} -> ${csvBowl} (SR ${wr.bowlSR}, ECON ${wr.bowlEcon}, ${wr._balls}b)`); }
      else report.bowlFallback.push(`${name} (kept ${hsBSR}/${hsECON})`);
    }
    if (Object.keys(out).length) resolved[key] = out;
    else report.unmatched.push(key);
  }
}

// ============================================================
// LARGER FREE-AGENT POOL (real legends + active players)
// ============================================================
function inferRole(name) {
  const b = bat[name], w = bowl[name];
  const batBalls = b ? b.balls : 0;
  const bowlBalls = w ? w.balls : 0;
  if (bowlBalls > 600 && batBalls > 400) return 'AR';
  if (bowlBalls > 600) return 'BOWL';
  return 'BAT';
}
const pool = [];
const allNames = new Set([...batNames, ...bowlNames]);
for (const name of allNames) {
  const b = bat[name], w = bowl[name];
  const batBalls = b ? b.balls : 0;
  const bowlBalls = w ? w.balls : 0;
  if (batBalls < 400 && bowlBalls < 400) continue; // only meaningful careers
  const role = inferRole(name);
  const br = batRatings(name);
  const wr = bowlRatings(name);
  pool.push({
    name, role,
    batSR: br ? br.batSR : (b ? round1((b.runs / Math.max(1, b.balls)) * 100) : 100),
    batAvg: br ? br.batAvg : (b ? round1(b.runs / Math.max(1, b.outs || 1)) : 15),
    bowlSR: wr ? wr.bowlSR : null,
    bowlEcon: wr ? wr.bowlEcon : null,
    runs: b ? b.runs : 0,
    wkts: w ? w.wkts : 0,
  });
}
pool.sort((a, b) => (b.runs + b.wkts * 20) - (a.runs + a.wkts * 20));
const topPool = pool.slice(0, 320);

// ============================================================
// RECORDS
// ============================================================
function topBatters(n) {
  return Object.entries(bat).filter(([, b]) => b.runs >= 1000)
    .map(([name, b]) => ({
      name, runs: b.runs, balls: b.balls,
      sr: round1((b.runs / b.balls) * 100),
      avg: b.outs ? round1(b.runs / b.outs) : b.runs,
      fours: b.fours, sixes: b.sixes,
      hs: hs[name] || 0, fifties: fifties[name] || 0, hundreds: hundreds[name] || 0,
      inns: inningsPlayed[name] || 0,
    }))
    .sort((a, b) => b.runs - a.runs).slice(0, n);
}
function topBowlers(n) {
  return Object.entries(bowl).filter(([, b]) => b.wkts >= 30)
    .map(([name, b]) => ({
      name, wkts: b.wkts, balls: b.balls, runs: b.runs,
      econ: round1((b.runs / b.balls) * 6),
      sr: round1(b.balls / b.wkts),
      avg: round1(b.runs / b.wkts),
    }))
    .sort((a, b) => b.wkts - a.wkts).slice(0, n);
}
function topBy(obj, n) {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n).map(([name, v]) => ({ name, v }));
}
const sixers = {};
for (const name in bat) if (bat[name].sixes) sixers[name] = bat[name].sixes;

const records = {
  topRunScorers: topBatters(20),
  topWicketTakers: topBowlers(20),
  mostSixes: topBy(sixers, 15),
  mostPOTM: topBy(potm, 15),
  highestTotals: highestTotals.map(t => ({
    runs: t.runs, team: t.team, opp: t.opp, venue: t.venue, season: t.season, inn: t.inn,
  })),
};

// ============================================================
// AGGREGATES (calibration + venues + toss + H2H)
// ============================================================
const leagueLegalBalls = phase.pp.balls + phase.mid.balls + phase.death.balls;
const leagueRuns = phase.pp.runs + phase.mid.runs + phase.death.runs;
const leagueRPO = (leagueRuns / leagueLegalBalls) * 6;
function phaseOut(p) {
  return {
    rpo: round2((p.runs / p.balls) * 6),
    wktRate: round4(p.wkts / p.balls),         // wickets per ball
    balls: p.balls,
  };
}
function round2(x){return Math.round(x*100)/100;}
function round4(x){return Math.round(x*10000)/10000;}

const venueList = Object.entries(venues)
  .filter(([, v]) => v.legalBalls >= 600)
  .map(([name, v]) => ({
    name,
    rpo: round2((v.runs / v.legalBalls) * 6),
    factor: round3(((v.runs / v.legalBalls) * 6) / leagueRPO),
    balls: v.legalBalls,
  }))
  .sort((a, b) => b.rpo - a.rpo);
function round3(x){return Math.round(x*1000)/1000;}

const leagueWkts = phase.pp.wkts + phase.mid.wkts + phase.death.wkts;
const leagueWktRate = leagueWkts / leagueLegalBalls;
function phaseFactor(p) {
  return {
    runFactor: round3(((p.runs / p.balls) * 6) / leagueRPO),   // scoring vs league avg
    wktFactor: round3((p.wkts / p.balls) / leagueWktRate),     // dismissal risk vs league avg
  };
}
function normDist(rd) {
  const out = {};
  for (const k of [0, 1, 2, 3, 4, 6]) out[k] = round4(rd[k] / rd.balls);
  return out;
}

const aggregates = {
  leagueRPO: round2(leagueRPO),
  leagueWktRate: round4(leagueWktRate),
  avgInningsTotal: round1(leagueRuns / Object.keys(teamInnTotal).length),
  phases: { powerplay: phaseOut(phase.pp), middle: phaseOut(phase.mid), death: phaseOut(phase.death) },
  phaseFactors: {
    powerplay: phaseFactor(phase.pp),
    middle: phaseFactor(phase.mid),
    death: phaseFactor(phase.death),
  },
  runDist: {
    powerplay: normDist(runDist.pp),
    middle: normDist(runDist.mid),
    death: normDist(runDist.death),
  },
  extras: {
    perInningsRate: round4(extras.total / (extras.legalBalls / 6)),   // extra runs per over
    wideRate: round4(extras.wides / extras.legalBalls),               // wides per legal ball
    noballRate: round4(extras.noballs / extras.legalBalls),
    byeRate: round4((extras.byes + extras.legbyes) / extras.legalBalls),
    extraRunsPerLegalBall: round4(extras.total / extras.legalBalls),
  },
  dismissals: dismiss,
  dismissalMix: (() => {
    const total = Object.values(dismiss).reduce((a, b) => a + b, 0);
    const m = {};
    for (const k in dismiss) m[k] = round4(dismiss[k] / total);
    return m;
  })(),
  venues: venueList,
  h2h,
};
aggregates.toss = {
  fieldFirstProb: round3(tossDec.field / (tossDec.field + tossDec.bat)),
  tossWinnerWinRate: round3(tossWinIsMatchWin / tossDecided),
};

// ============================================================
// WRITE OUTPUTS
// ============================================================
fs.mkdirSync(OUT, { recursive: true });
const banner = '// AUTO-GENERATED by scripts/extract-ipl.mjs — do not edit by hand.\n';

fs.writeFileSync(path.join(OUT, 'realPlayerStats.js'),
  banner +
  '// Real IPL career ratings resolved onto the curated rosters, keyed "TEAM:Player Name".\n' +
  'export const REAL_PLAYER_STATS = ' + JSON.stringify(resolved, null, 0) + ';\n\n' +
  '// Larger free-agent pool of real players (legends + active) for the transfer market.\n' +
  'export const REAL_PLAYER_POOL = ' + JSON.stringify(topPool, null, 0) + ';\n');

fs.writeFileSync(path.join(OUT, 'iplAggregates.js'),
  banner +
  'export const IPL_AGGREGATES = ' + JSON.stringify(aggregates, null, 0) + ';\n');

fs.writeFileSync(path.join(OUT, 'iplRecords.js'),
  banner +
  'export const IPL_RECORDS = ' + JSON.stringify(records, null, 0) + ';\n');

// ============================================================
// VALIDATION REPORT
// ============================================================
console.log('\n==================== VALIDATION ====================');
console.log('Resolved roster players:', Object.keys(resolved).length, '/ 120ish');
console.log('Batting matched:', report.batched.length, '| fallback:', report.batFallback.length);
console.log('Bowling matched:', report.bowlMatched.length, '| fallback:', report.bowlFallback.length);
console.log('\n-- Batting fallbacks (no/low CSV sample, kept hand-tuned) --');
report.batFallback.forEach(s => console.log('  ', s));
console.log('\n-- Bowling fallbacks --');
report.bowlFallback.forEach(s => console.log('  ', s));
console.log('\n-- Spot-check resolved ratings --');
for (const k of ['RCB:Virat Kohli','CSK:MS Dhoni','CSK:Ravindra Jadeja','MI:Rohit Sharma','MI:Suryakumar Yadav','MI:Jasprit Bumrah','GT:Rashid Khan','RR:Yuzvendra Chahal','DC:David Warner','RR:Jos Buttler','GT:Shubman Gill','KKR:Sunil Narine','KKR:Andre Russell','RCB:Dinesh Karthik','LSG:KL Rahul','SRH:Travis Head']) {
  if (resolved[k]) console.log('  ', k, JSON.stringify(resolved[k]));
  else console.log('   MISSING', k);
}
console.log('\n-- Sanity (known records) --');
console.log('   Kohli runs:', bat['V Kohli']?.runs, '(expect 8899)');
console.log('   Chahal wkts:', bowl['YS Chahal']?.wkts, '(expect ~224)');
console.log('   League RPO:', aggregates.leagueRPO, '| avg innings:', aggregates.avgInningsTotal);
console.log('   Phases:', JSON.stringify(aggregates.phases));
console.log('   Toss:', JSON.stringify(aggregates.toss));
console.log('   Pool size:', topPool.length, '| Venues:', venueList.length);
console.log('\nWrote 3 files to', OUT);
