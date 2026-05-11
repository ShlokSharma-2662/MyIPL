import { TEAMS, getLineup, playerKey } from './data';
import {
  MAX_BALLS, TOSS_FIELD_FIRST_PROB, MAX_BALLS_PER_BOWLER, MAX_ACTIVE_BOWLERS,
  POWERPLAY_BALLS, IMPACT_WICKET_THRESHOLD, FORM_MIN, FORM_MAX, LEAGUE_MATCHES_PER_TEAM,
  GOD_BAT_SR, GOD_BAT_AVG, GOD_BOWL_SR, GOD_BOWL_ECON,
} from './constants';

// ============================================================
// HELPERS
// ============================================================
export function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
export function rand(min, max) { return min + Math.random() * (max - min); }
export function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
export function pick(arr) { return arr[randInt(0, arr.length - 1)]; }
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Generate per-match form factors per player.
// User player is always at peak (1.0) — others get random form between FORM_MIN..FORM_MAX.
function generateFormFactors(...lineups) {
  const factors = {};
  for (const lineup of lineups) {
    for (const p of lineup) {
      if (!p) continue;
      const key = playerKey(p);
      if (factors[key] !== undefined) continue;
      factors[key] = p.isUser ? 1.0 : FORM_MIN + Math.random() * (FORM_MAX - FORM_MIN);
    }
  }
  return factors;
}

// ============================================================
// SIMULATION
// ============================================================
function simulateInnings(batSquad, bowlSquad, formFactors, target = null) {
  let totalRuns = 0, wickets = 0, balls = 0;

  let batXI = [...batSquad.slice(0, 11)];
  const batIP = batSquad[11];
  let batImpactUsed = false;
  let batSubOut = null;

  let bowlXI = [...bowlSquad.slice(0, 11)];
  const bowlIP = bowlSquad[11];
  let bowlImpactUsed = false;
  let bowlSubOut = null;

  const allBatters = batXI.map(p => ({ player: p, runs: 0, balls: 0, fours: 0, sixes: 0, out: false, batted: false, sr: 0 }));

  let strikerIdx = 0;
  let nonStrikerIdx = 1;
  let nextIdx = 2;

  allBatters[0].batted = true;
  allBatters[1].batted = true;

  while (balls < MAX_BALLS && wickets < 10) {
    if (target !== null && totalRuns >= target) break;

    if (batIP && !batImpactUsed && wickets >= IMPACT_WICKET_THRESHOLD) {
      let worstIdx = -1;
      let worstAvg = 999;
      for (let k = nextIdx; k < 11; k++) {
        if (allBatters[k].player.batAvg < worstAvg) {
          worstAvg = allBatters[k].player.batAvg;
          worstIdx = k;
        }
      }
      if (worstIdx !== -1 && batIP.batAvg > worstAvg) {
        batSubOut = batXI[worstIdx];
        batXI[worstIdx] = batIP;
        batXI[worstIdx].isImpact = true;
        allBatters[worstIdx].player = batIP;
        batImpactUsed = true;
      }
    }

    let ballsThisOver = Math.min(6, MAX_BALLS - balls);
    for (let b = 0; b < ballsThisOver; b++) {
      if (wickets >= 10 || (target !== null && totalRuns >= target)) break;

      let striker = allBatters[strikerIdx];
      striker.balls++;
      balls++;

      const isPowerplay = balls <= POWERPLAY_BALLS;
      const form = formFactors[playerKey(striker.player)] ?? 1;
      let batSR = striker.player.batSR * form;
      let batAvg = striker.player.batAvg * form;
      if (isPowerplay) { batSR *= 1.15; batAvg *= 0.95; }

      let outProb = 1 / Math.max(1, ((batAvg * 100) / batSR));
      if (Math.random() < outProb) {
        striker.out = true;
        wickets++;
        if (wickets < 10 && nextIdx < 11) {
          strikerIdx = nextIdx++;
          allBatters[strikerIdx].batted = true;
        }
        continue;
      }

      let runProb = Math.random();
      let runScored = 0;
      let srFactor = batSR / 100;

      let p6 = 0.06 * srFactor;
      let p4 = p6 + 0.08 * srFactor;
      let p2 = p4 + 0.05 * srFactor;
      let p1 = p2 + 0.25 * srFactor;

      if (runProb < p6) { runScored = 6; striker.sixes++; }
      else if (runProb < p4) { runScored = 4; striker.fours++; }
      else if (runProb < p2) { runScored = 2; }
      else if (runProb < p1) { runScored = 1; }
      else { runScored = 0; }

      if (target !== null && totalRuns + runScored > target) {
        runScored = target - totalRuns;
        if (runScored === 6) striker.sixes++;
        else if (runScored === 4) striker.fours++;
      }

      striker.runs += runScored;
      totalRuns += runScored;

      if (runScored === 1 || runScored === 3) {
        let temp = strikerIdx;
        strikerIdx = nonStrikerIdx;
        nonStrikerIdx = temp;
      }
    }
    let temp = strikerIdx;
    strikerIdx = nonStrikerIdx;
    nonStrikerIdx = temp;
  }

  const battersCard = allBatters.filter(b => b.batted).map(b => {
    b.sr = b.balls > 0 ? Math.round((b.runs / b.balls) * 1000) / 10 : 0;
    return b;
  });

  const extras = randInt(2, 12);
  totalRuns += extras;

  let activeBowlers = bowlXI.filter(p => p.bowls);
  if (bowlIP && !bowlImpactUsed && bowlIP.bowls) {
    const sortedBowlers = [...activeBowlers].sort((a, b) => b.bowlEcon - a.bowlEcon);
    if (sortedBowlers.length > 0 && bowlIP.bowlEcon < sortedBowlers[0].bowlEcon) {
      const worstBowler = sortedBowlers[0];
      const idx = activeBowlers.indexOf(worstBowler);
      bowlSubOut = worstBowler;
      activeBowlers[idx] = bowlIP;
      bowlIP.isImpact = true;
      bowlImpactUsed = true;
    }
  }

  activeBowlers = activeBowlers.slice(0, Math.min(MAX_ACTIVE_BOWLERS, activeBowlers.length));

  const bowlerStats = activeBowlers.map(b => ({ player: b, balls: 0, runs: 0, wickets: 0, econ: 0 }));
  let bRem = balls;

  for (let b of bowlerStats) {
    if (bRem >= 6) { b.balls += 6; bRem -= 6; }
    else if (bRem > 0) { b.balls += bRem; bRem = 0; }
  }

  let bIdx = 0;
  let guard = 0;
  while (bRem > 0 && guard < 50) {
    const b = bowlerStats[bIdx];
    if (b.balls < MAX_BALLS_PER_BOWLER) {
      if (bRem >= 6) { b.balls += 6; bRem -= 6; }
      else { b.balls += bRem; bRem = 0; }
    }
    bIdx = (bIdx + 1) % bowlerStats.length;
    guard++;
  }

  const targetBowlerRuns = Math.max(0, totalRuns - Math.floor(extras / 2));
  let runsToDistribute = targetBowlerRuns;

  let totalWeights = bowlerStats.reduce((sum, b) => sum + (b.player.bowlEcon * b.balls), 0);

  for (let i = 0; i < bowlerStats.length; i++) {
    let b = bowlerStats[i];
    if (b.balls === 0) continue;

    if (i === bowlerStats.length - 1) {
      b.runs = runsToDistribute;
    } else {
      let expectedRuns = totalWeights > 0 ? Math.round((b.player.bowlEcon * b.balls) / totalWeights * targetBowlerRuns) : 0;
      b.runs = Math.min(runsToDistribute, expectedRuns);
      runsToDistribute -= b.runs;
    }
  }

  let wktLeft = wickets;
  const wktWeights = bowlerStats.map(b => b.balls > 0 ? (b.balls / b.player.bowlSR) : 0);
  guard = 0;
  while (wktLeft > 0 && guard < 50) {
    const tot = wktWeights.reduce((s, w) => s + w, 0);
    if (tot === 0) break;
    let r = Math.random() * tot;
    for (let i = 0; i < bowlerStats.length; i++) {
      r -= wktWeights[i];
      if (r <= 0) { bowlerStats[i].wickets++; wktLeft--; break; }
    }
    guard++;
  }

  let validBowlers = bowlerStats.filter(b => b.balls > 0);
  while (wktLeft > 0 && validBowlers.length > 0) {
    validBowlers[randInt(0, validBowlers.length - 1)].wickets++;
    wktLeft--;
  }

  const bowlersCard = validBowlers.map(b => {
    const oversInt = Math.floor(b.balls / 6);
    const oversRem = b.balls % 6;
    const oversStr = oversRem === 0 ? String(oversInt) : `${oversInt}.${oversRem}`;
    const oversNum = oversInt + (oversRem / 6);
    return {
      player: b.player,
      overs: oversStr,
      balls: b.balls,
      runs: Math.max(0, b.runs),
      wickets: b.wickets,
      econ: oversNum > 0 ? Math.round((b.runs / oversNum) * 10) / 10 : 0,
    };
  });

  return {
    totalRuns, wickets, balls, extras,
    battersCard, bowlersCard,
    batImpactUsed, batSubOut, batIP: batImpactUsed ? batIP : null,
    bowlImpactUsed, bowlSubOut, bowlIP: bowlImpactUsed ? bowlIP : null,
    overs: Math.floor(balls / 6) + (balls % 6 ? `.${balls % 6}` : ''),
    oversDisplay: `${Math.floor(balls / 6)}${balls % 6 ? '.' + (balls % 6) : ''}`,
  };
}

export function simulateMatch(homeId, awayId, userName, playersMap, label = 'League', preTossWinner = null, preTossDecision = null, godMode = false) {
  // If god mode is active, swap in a boosted user player for this match only.
  let effectivePlayersMap = playersMap;
  const userKey = `USER:${userName}`;
  if (godMode && playersMap[userKey]) {
    effectivePlayersMap = {
      ...playersMap,
      [userKey]: {
        ...playersMap[userKey],
        batSR: GOD_BAT_SR,
        batAvg: GOD_BAT_AVG,
        bowlSR: GOD_BOWL_SR,
        bowlEcon: GOD_BOWL_ECON,
        godMode: true,
      },
    };
  }

  const homeLineup = getLineup(homeId, userName, effectivePlayersMap);
  const awayLineup = getLineup(awayId, userName, effectivePlayersMap);

  const tossWinner = preTossWinner || (Math.random() < 0.5 ? homeId : awayId);
  const tossDecision = preTossDecision || (Math.random() < TOSS_FIELD_FIRST_PROB ? 'bowl' : 'bat');

  let battingFirst, battingSecond;
  if (tossDecision === 'bat') {
    battingFirst = tossWinner;
    battingSecond = tossWinner === homeId ? awayId : homeId;
  } else {
    battingFirst = tossWinner === homeId ? awayId : homeId;
    battingSecond = tossWinner;
  }

  const firstBatSquad = battingFirst === homeId ? homeLineup : awayLineup;
  const firstBowlSquad = battingFirst === homeId ? awayLineup : homeLineup;
  const secondBatSquad = battingFirst === homeId ? awayLineup : homeLineup;
  const secondBowlSquad = battingFirst === homeId ? homeLineup : awayLineup;

  // Per-match form factors — applied to both innings consistently
  const formFactors = generateFormFactors(homeLineup, awayLineup);

  const inn1 = simulateInnings(firstBatSquad, firstBowlSquad, formFactors);
  const target = inn1.totalRuns + 1;
  const inn2 = simulateInnings(secondBatSquad, secondBowlSquad, formFactors, target);

  let winner, margin, marginType;
  if (inn2.totalRuns >= target) {
    winner = battingSecond;
    margin = 10 - inn2.wickets;
    marginType = 'wickets';
  } else if (inn2.totalRuns === inn1.totalRuns) {
    winner = Math.random() < 0.5 ? battingFirst : battingSecond;
    margin = 0;
    marginType = 'Super Over';
  } else {
    winner = battingFirst;
    margin = inn1.totalRuns - inn2.totalRuns;
    marginType = 'runs';
  }

  return {
    home: homeId, away: awayId,
    label, tossWinner, tossDecision,
    battingFirst, battingSecond,
    inn1, inn2,
    winner, margin, marginType,
    godMode,
  };
}

// Pick 6-7 random CSK league match indices for god mode.
export function pickGodModeMatches(schedule, userTeam, minCount, maxCount) {
  const cskIndices = [];
  schedule.forEach((m, i) => {
    if (m.home === userTeam || m.away === userTeam) cskIndices.push(i);
  });
  const count = Math.min(cskIndices.length, minCount + Math.floor(Math.random() * (maxCount - minCount + 1)));
  return shuffle(cskIndices).slice(0, count).sort((a, b) => a - b);
}

// ============================================================
// SCHEDULE
// ============================================================
export function generateSchedule() {
  const teamIds = TEAMS.map(t => t.id);
  const counts = Object.fromEntries(teamIds.map(id => [id, 0]));
  const matches = [];

  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      const [a, b] = Math.random() < 0.5 ? [teamIds[i], teamIds[j]] : [teamIds[j], teamIds[i]];
      matches.push({ home: a, away: b });
      counts[a]++; counts[b]++;
    }
  }

  const allPairs = [];
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) allPairs.push([teamIds[i], teamIds[j]]);
  }
  shuffle(allPairs).forEach(([a, b]) => {
    if (counts[a] < LEAGUE_MATCHES_PER_TEAM && counts[b] < LEAGUE_MATCHES_PER_TEAM) {
      const [h, w] = Math.random() < 0.5 ? [a, b] : [b, a];
      matches.push({ home: h, away: w });
      counts[a]++; counts[b]++;
    }
  });

  let guard = 0;
  while (!teamIds.every(t => counts[t] === LEAGUE_MATCHES_PER_TEAM) && guard < 50) {
    for (const a of teamIds) {
      if (counts[a] >= LEAGUE_MATCHES_PER_TEAM) continue;
      for (const b of teamIds) {
        if (b === a || counts[b] >= LEAGUE_MATCHES_PER_TEAM) continue;
        matches.push({ home: a, away: b });
        counts[a]++; counts[b]++;
        break;
      }
    }
    guard++;
  }

  return shuffle(matches);
}

export function decideToss(homeId, awayId) {
  const tossWinner = Math.random() < 0.5 ? homeId : awayId;
  const tossDecision = Math.random() < TOSS_FIELD_FIRST_PROB ? 'bowl' : 'bat';
  return { tossWinner, tossDecision };
}
