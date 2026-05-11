import { TEAMS } from './data';

export function blankTeamStat() {
  return { P: 0, W: 0, L: 0, NR: 0, Pts: 0, runsFor: 0, ballsFor: 0, runsAgainst: 0, ballsAgainst: 0 };
}

export function blankPlayerStat() {
  return {
    M: 0, runs: 0, balls: 0, fours: 0, sixes: 0, fifties: 0, hundreds: 0, HS: 0, outs: 0,
    wkts: 0, runsConceded: 0, ballsBowled: 0, bestW: 0, bestR: 999,
  };
}

export function computeNRR(s) {
  if (s.ballsFor === 0 || s.ballsAgainst === 0) return 0;
  const rf = (s.runsFor / s.ballsFor) * 6;
  const ra = (s.runsAgainst / s.ballsAgainst) * 6;
  return Math.round((rf - ra) * 1000) / 1000;
}

export function recalcAll(matchResults, userName) {
  const teamStats = {};
  TEAMS.forEach(t => teamStats[t.id] = blankTeamStat());

  const playerStats = {};

  function ensure(p) {
    const key = p.isUser ? `USER:${userName}` : `${p.team}:${p.name}`;
    if (!playerStats[key]) playerStats[key] = { ...blankPlayerStat(), player: p, key };
    return playerStats[key];
  }

  for (const m of matchResults) {
    const t1 = teamStats[m.battingFirst];
    const t2 = teamStats[m.battingSecond];
    t1.P++; t2.P++;

    t1.runsFor += m.inn1.totalRuns;
    t1.ballsFor += Math.min(m.inn1.balls, 120);
    t1.runsAgainst += m.inn2.totalRuns;
    t1.ballsAgainst += Math.min(m.inn2.balls, 120);

    t2.runsFor += m.inn2.totalRuns;
    t2.ballsFor += Math.min(m.inn2.balls, 120);
    t2.runsAgainst += m.inn1.totalRuns;
    t2.ballsAgainst += Math.min(m.inn1.balls, 120);

    if (m.winner === m.battingFirst) { t1.W++; t1.Pts += 2; t2.L++; }
    else if (m.winner === m.battingSecond) { t2.W++; t2.Pts += 2; t1.L++; }

    const all = [
      ...m.inn1.battersCard.map(x => ({ ...x, side: 'bat' })),
      ...m.inn2.battersCard.map(x => ({ ...x, side: 'bat' })),
      ...m.inn1.bowlersCard.map(x => ({ ...x, side: 'bowl' })),
      ...m.inn2.bowlersCard.map(x => ({ ...x, side: 'bowl' })),
    ];

    const seenThisMatch = new Set();

    for (const entry of all) {
      const s = ensure(entry.player);
      if (!seenThisMatch.has(s.key)) { s.M++; seenThisMatch.add(s.key); }
      if (entry.side === 'bat') {
        s.runs += entry.runs;
        s.balls += entry.balls;
        s.fours += entry.fours;
        s.sixes += entry.sixes;
        if (entry.out) s.outs++;
        if (entry.runs >= 50 && entry.runs < 100) s.fifties++;
        if (entry.runs >= 100) s.hundreds++;
        if (entry.runs > s.HS) s.HS = entry.runs;
      } else {
        s.wkts += entry.wickets;
        s.runsConceded += entry.runs;
        s.ballsBowled += entry.balls;
        if (entry.wickets > s.bestW || (entry.wickets === s.bestW && entry.runs < s.bestR)) {
          s.bestW = entry.wickets;
          s.bestR = entry.runs;
        }
      }
    }
  }

  return { teamStats, playerStats };
}
