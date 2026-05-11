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
      factors[key] = p.isUser ? rand(1.25, 1.75) : FORM_MIN + Math.random() * (FORM_MAX - FORM_MIN);
    }
  }
  return factors;
}

// ============================================================
// SIMULATION
// ============================================================
function simulateInnings(batSquad, bowlSquad, formFactors, target = null) {
  let totalRuns = 0, wickets = 0, balls = 0, extras = 0;

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

  // Initialize Bowlers
  let activeBowlers = bowlXI.filter(p => p.bowls).map(p => ({
    player: p, balls: 0, runs: 0, wickets: 0, econ: 0
  }));

  // Use up to MAX_ACTIVE_BOWLERS bowlers, prioritized by economy
  activeBowlers = activeBowlers.sort((a, b) => a.player.bowlEcon - b.player.bowlEcon).slice(0, Math.min(MAX_ACTIVE_BOWLERS, activeBowlers.length));

  let lastBowlerIdx = -1;

  while (balls < MAX_BALLS && wickets < 10) {
    if (target !== null && totalRuns >= target) break;

    // Batting Impact Player logic
    if (batIP && !batImpactUsed && wickets >= IMPACT_WICKET_THRESHOLD) {
      let worstIdx = -1;
      let worstScore = 9999;
      let isDeathOvers = balls >= 90; // 15th over onwards

      for (let k = nextIdx; k < 11; k++) {
        if (allBatters[k].player.isUser) continue; // Protect user
        let score = isDeathOvers ? allBatters[k].player.batSR : allBatters[k].player.batAvg;
        if (score < worstScore) {
          worstScore = score;
          worstIdx = k;
        }
      }
      let ipScore = isDeathOvers ? batIP.batSR : batIP.batAvg;
      if (worstIdx !== -1 && ipScore > worstScore) {
        batSubOut = batXI[worstIdx];
        batXI[worstIdx] = batIP;
        batXI[worstIdx].isImpact = true;
        allBatters[worstIdx].player = batIP;
        batImpactUsed = true;
      }
    }

    // Bowling Impact Player logic
    if (bowlIP && !bowlImpactUsed && bowlIP.bowls) {
      let exhaustedBowlerIdx = activeBowlers.findIndex(b => b.balls >= MAX_BALLS_PER_BOWLER && b.player !== bowlIP && !b.player.isUser); // Protect user
      if (exhaustedBowlerIdx !== -1) {
        bowlSubOut = activeBowlers[exhaustedBowlerIdx].player;
        activeBowlers.push({ player: bowlIP, balls: 0, runs: 0, wickets: 0, econ: 0 });
        bowlIP.isImpact = true;
        bowlImpactUsed = true;
      }
    }

    // Select Bowler for this over using round-robin to ensure even distribution and max 4 overs
    let currentBowlerIdx = -1;
    for (let offset = 1; offset <= activeBowlers.length; offset++) {
      let idx = (lastBowlerIdx + offset) % activeBowlers.length;
      if (activeBowlers[idx].balls < MAX_BALLS_PER_BOWLER) {
        currentBowlerIdx = idx;
        break;
      }
    }
    
    // Fallback if all bowlers exhausted (shouldn't happen before 20 overs)
    if (currentBowlerIdx === -1) break;
    
    lastBowlerIdx = currentBowlerIdx;
    let bowler = activeBowlers[currentBowlerIdx];    let legalBallsThisOver = 0;
    while (legalBallsThisOver < 6 && balls < MAX_BALLS && wickets < 10) {
      if (target !== null && totalRuns >= target) break;

      let striker = allBatters[strikerIdx];

      // Extras logic
      if (Math.random() < 0.04) {
        // Wide or No Ball
        extras++;
        totalRuns++;
        bowler.runs++;
        continue; // Does not count as a legal ball
      }

      // Legal delivery
      legalBallsThisOver++;
      striker.balls++;
      bowler.balls++;
      balls++;

      // Form and powerplay factors
      const isPowerplay = balls <= POWERPLAY_BALLS;
      const batForm = formFactors[playerKey(striker.player)] ?? 1;
      const bowlForm = formFactors[playerKey(bowler.player)] ?? 1;
      
      let batSR = striker.player.batSR * batForm;
      let batAvg = striker.player.batAvg * batForm;
      let bowlSR = bowler.player.bowlSR / Math.max(0.1, bowlForm);
      let bowlEcon = bowler.player.bowlEcon / Math.max(0.1, bowlForm);

      if (isPowerplay) { 
        batSR *= 1.15; batAvg *= 0.95; 
        bowlEcon *= 1.15; bowlSR *= 1.05; // slightly worse for bowlers
      }

      // Ball outcome probability combining batter and bowler stats
      let batOutProb = (batSR / 100) / Math.max(1, batAvg);
      let bowlOutProb = 1 / Math.max(1, bowlSR);
      let outProb = (batOutProb + bowlOutProb) / 2;

      if (Math.random() < outProb) {
        striker.out = true;
        wickets++;
        bowler.wickets++;
        if (wickets < 10 && nextIdx < 11) {
          strikerIdx = nextIdx++;
          allBatters[strikerIdx].batted = true;
        }
        continue;
      }

      let batRPB = batSR / 100;
      let bowlRPB = bowlEcon / 6;
      let rpb = (batRPB + bowlRPB) / 2;

      let runProb = Math.random();
      let runScored = 0;

      let p6 = 0.06 * rpb;
      let p4 = p6 + 0.08 * rpb;
      let p2 = p4 + 0.05 * rpb;
      let p1 = p2 + 0.25 * rpb;

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
      bowler.runs += runScored;
      totalRuns += runScored;

      if (runScored === 1 || runScored === 3) {
        let temp = strikerIdx;
        strikerIdx = nonStrikerIdx;
        nonStrikerIdx = temp;
      }
    }

    // Switch ends at the end of the over
    let temp = strikerIdx;
    strikerIdx = nonStrikerIdx;
    nonStrikerIdx = temp;
  }

  const battersCard = allBatters.filter(b => b.batted).map(b => {
    b.sr = b.balls > 0 ? Math.round((b.runs / b.balls) * 1000) / 10 : 0;
    return b;
  });

  const bowlersCard = activeBowlers.filter(b => b.balls > 0).map(b => {
    const oversInt = Math.floor(b.balls / 6);
    const oversRem = b.balls % 6;
    const oversStr = oversRem === 0 ? String(oversInt) : `${oversInt}.${oversRem}`;
    const oversNum = oversInt + (oversRem / 6);
    return {
      player: b.player,
      overs: oversStr,
      balls: b.balls,
      runs: b.runs,
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

  // Dynamic user form adjustment based on 1st innings performance
  if (formFactors[userKey]) {
    let userBatted = inn1.battersCard.find(b => b.player.isUser);
    let userBowled = inn1.bowlersCard.find(b => b.player.isUser);

    if (userBatted) {
      if (userBatted.runs < 25) {
        formFactors[userKey] += 0.75; // Boost bowling
      }
    } else if (userBowled) {
      if (userBowled.wickets === 0 || userBowled.econ > 9.0) {
        formFactors[userKey] += 0.75; // Boost batting
      }
    }
  }

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
  const teamIds = shuffle(TEAMS.map(t => t.id));
  const groupA = teamIds.slice(0, 5);
  const groupB = teamIds.slice(5, 10);
  
  const matches = [];

  const addMatch = (t1, t2) => {
    const [home, away] = Math.random() < 0.5 ? [t1, t2] : [t2, t1];
    matches.push({ home, away });
  };

  // 1. Intra-group (play twice)
  for (let i = 0; i < 5; i++) {
    for (let j = i + 1; j < 5; j++) {
      addMatch(groupA[i], groupA[j]);
      addMatch(groupA[i], groupA[j]);
      
      addMatch(groupB[i], groupB[j]);
      addMatch(groupB[i], groupB[j]);
    }
  }

  // 2. Inter-group (play once, plus row-equivalent plays twice)
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      addMatch(groupA[i], groupB[j]);
      if (i === j) {
        addMatch(groupA[i], groupB[j]);
      }
    }
  }

  return shuffle(matches);
}

export function decideToss(homeId, awayId) {
  const tossWinner = Math.random() < 0.5 ? homeId : awayId;
  const tossDecision = Math.random() < TOSS_FIELD_FIRST_PROB ? 'bowl' : 'bat';
  return { tossWinner, tossDecision };
}
