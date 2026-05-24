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

export function accumulateMatchStats(existingTeamStats, existingPlayerStats, m, userName) {
  const teamStats = { ...existingTeamStats };
  const playerStats = { ...existingPlayerStats };

  function ensureTeam(id) {
    if (!teamStats[id]) teamStats[id] = blankTeamStat();
    return teamStats[id];
  }

  function ensurePlayer(p) {
    const key = p.isUser ? `USER:${userName}` : `${p.team}:${p.name}`;
    if (!playerStats[key]) playerStats[key] = { ...blankPlayerStat(), player: p, key };
    return playerStats[key];
  }

  const t1Id = m.battingFirst;
  const t2Id = m.battingSecond;
  
  ensureTeam(t1Id);
  ensureTeam(t2Id);
  
  // Clone to avoid mutating existing state
  const t1 = { ...teamStats[t1Id] };
  const t2 = { ...teamStats[t2Id] };
  
  // Only update team standings for league matches, not playoffs
  if (m.label === 'League') {
    t1.P++; t2.P++;

    t1.runsFor += m.inn1.totalRuns;
    t1.ballsFor += Math.min(m.inn1.balls, 120);
    t1.runsAgainst += m.inn2.totalRuns;
    t1.ballsAgainst += Math.min(m.inn2.balls, 120);

    t2.runsFor += m.inn2.totalRuns;
    t2.ballsFor += Math.min(m.inn2.balls, 120);
    t2.runsAgainst += m.inn1.totalRuns;
    t2.ballsAgainst += Math.min(m.inn1.balls, 120);

    if (m.winner === t1Id) { t1.W++; t1.Pts += 2; t2.L++; }
    else if (m.winner === t2Id) { t2.W++; t2.Pts += 2; t1.L++; }
  }

  teamStats[t1Id] = t1;
  teamStats[t2Id] = t2;

  const all = [
    ...m.inn1.battersCard.map(x => ({ ...x, side: 'bat' })),
    ...m.inn2.battersCard.map(x => ({ ...x, side: 'bat' })),
    ...m.inn1.bowlersCard.map(x => ({ ...x, side: 'bowl' })),
    ...m.inn2.bowlersCard.map(x => ({ ...x, side: 'bowl' })),
  ];

  const seenThisMatch = new Set();

  for (const entry of all) {
    const pKey = entry.player.isUser ? `USER:${userName}` : `${entry.player.team}:${entry.player.name}`;
    const s = { ...ensurePlayer(entry.player) };
    
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
    playerStats[pKey] = s;
  }

  return { teamStats, playerStats };
}

export function recalcAll(matchResults, userName) {
  let teamStats = {};
  let playerStats = {};
  TEAMS.forEach(t => teamStats[t.id] = blankTeamStat());

  for (const m of matchResults) {
    const res = accumulateMatchStats(teamStats, playerStats, m, userName);
    teamStats = res.teamStats;
    playerStats = res.playerStats;
  }
  return { teamStats, playerStats };
}

export function recalcAllInternational(matchResults, userName) {
  let playerStats = {};
  
  for (const m of matchResults) {
    const inningsList = [m.inn1, m.inn2, m.inn3, m.inn4].filter(Boolean);
    const seenThisMatch = new Set();
    
    for (const inn of inningsList) {
      const all = [
        ...inn.battersCard.map(x => ({ ...x, side: 'bat' })),
        ...inn.bowlersCard.map(x => ({ ...x, side: 'bowl' })),
      ];
      
      for (const entry of all) {
        const pKey = entry.player.isUser ? `USER:${userName}` : `${entry.player.team}:${entry.player.name}`;
        if (!playerStats[pKey]) {
          playerStats[pKey] = {
            M: 0, runs: 0, balls: 0, fours: 0, sixes: 0, fifties: 0, hundreds: 0, HS: 0, outs: 0,
            wkts: 0, runsConceded: 0, ballsBowled: 0, bestW: 0, bestR: 999,
            player: entry.player, key: pKey
          };
        }
        
        const s = playerStats[pKey];
        if (!seenThisMatch.has(s.key)) {
          s.M++;
          seenThisMatch.add(s.key);
        }
        
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
  }
  return playerStats;
}

