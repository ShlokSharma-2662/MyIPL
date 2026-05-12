import { useState, useMemo, useEffect } from 'react';
import { buildAllPlayers } from '../data';
import { GOD_MODE_MIN, GOD_MODE_MAX, TOSS_FIELD_FIRST_PROB } from '../constants';
import { simulateMatch, generateSchedule, pickGodModeMatches } from '../simulation';
import { recalcAll, accumulateMatchStats, computeNRR } from '../stats';
import { LEGACY_HISTORY, LEGACY_RIVALRIES } from '../historyData';
import { saveStateToFirebase, loadStateFromFirebase, clearFirebaseState } from '../firebase';

const STORAGE_KEY = 'ipl_sim_state_v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function rollToss(homeId, awayId) {
  const tossWinner = Math.random() < 0.5 ? homeId : awayId;
  const tossDecision = Math.random() < TOSS_FIELD_FIRST_PROB ? 'bowl' : 'bat';
  return { tossWinner, tossDecision };
}

export function useTournament() {
  const [userName, setUserName] = useState(null);
  const [userTeam, setUserTeam] = useState('CSK');
  const [tourney, setTourney] = useState('Indian Premier League');
  const [schedule, setSchedule] = useState([]);
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState('setup'); // setup | league | playoffs | done
  const [tab, setTab] = useState('table');
  const [playoff, setPlayoff] = useState({ q1: null, elim: null, q2: null, final: null });
  const [playoffStep, setPlayoffStep] = useState(0);
  const [champion, setChampion] = useState(null);
  const [openMatch, setOpenMatch] = useState(null);
  const [pendingToss, setPendingToss] = useState(null);
  const [godModeMatches, setGodModeMatches] = useState([]);
  const [godAlerts, setGodAlerts] = useState([]);
  const [usedPlayoffGodMode, setUsedPlayoffGodMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Incremental stats state
  const [teamStats, setTeamStats] = useState({});
  const [allPlayerStats, setAllPlayerStats] = useState({});

  const [history, setHistory] = useState(LEGACY_HISTORY);
  const [careerRivalries, setCareerRivalries] = useState(LEGACY_RIVALRIES);

  useEffect(() => {
    async function init() {
      try {
        let saved = await loadStateFromFirebase();
        if (!saved) {
          saved = loadState();
        }

        if (saved && saved.phase !== 'setup' && saved.userName) {
          setUserName(saved.userName);
          setUserTeam(saved.userTeam || 'CSK');
          setTourney(saved.tourney);
          setSchedule(saved.schedule || []);
          setResults(saved.results || []);
          setPhase(saved.phase);
          setPlayoff(saved.playoff || { q1: null, elim: null, q2: null, final: null });
          setPlayoffStep(saved.playoffStep || 0);
          setChampion(saved.champion || null);
          setGodModeMatches(saved.godModeMatches || []);
          setUsedPlayoffGodMode(saved.usedPlayoffGodMode || false);
          if (saved.careerRivalries) {
            setCareerRivalries(saved.careerRivalries);
          }

          if (saved.history) {
            // Retroactively patch old saved history with the new comprehensive stats
            const patchedHistory = saved.history.map(sh => {
              if (sh.playerStats && (sh.playerStats.M === undefined || sh.playerStats.outs === undefined)) {
                const legacyMatch = LEGACY_HISTORY.find(lh => lh.season === sh.season);
                if (legacyMatch) {
                  return {
                    ...sh,
                    playerStats: {
                      ...legacyMatch.playerStats,
                      // Keep their actual saved runs/wickets if they exist, otherwise use legacy fallback
                      runs: sh.playerStats.runs !== undefined ? sh.playerStats.runs : legacyMatch.playerStats.runs,
                      wickets: sh.playerStats.wickets !== undefined ? sh.playerStats.wickets : legacyMatch.playerStats.wickets,
                      M: sh.playerStats.M !== undefined ? sh.playerStats.M : legacyMatch.playerStats.M,
                      outs: sh.playerStats.outs !== undefined ? sh.playerStats.outs : legacyMatch.playerStats.outs,
                    }
                  };
                } else {
                  // For dynamically generated seasons that lacked 'outs', assign a random realistic value
                  const matches = sh.playerStats.M || 14;
                  const randomOuts = Math.floor(Math.random() * (matches - 2)) + 2;
                  return {
                    ...sh,
                    playerStats: {
                      ...sh.playerStats,
                      outs: sh.playerStats.outs !== undefined ? sh.playerStats.outs : randomOuts
                    }
                  };
                }
              }
              return sh;
            })
              .filter(h => !(h.season === 8 && h.orangeCap?.name === 'Unknown'))
              .map((h, i) => ({ ...h, season: i + 1 }));

            setHistory(patchedHistory);
          }

          // If hydrated from storage, do one full recalc (safer than saving huge stats objects)
          const allMatches = [
            ...(saved.results || []),
            ...[saved.playoff?.q1, saved.playoff?.elim, saved.playoff?.q2, saved.playoff?.final].filter(Boolean),
          ];
          const recalculated = recalcAll(allMatches, saved.userName);
          setTeamStats(recalculated.teamStats);
          setAllPlayerStats(recalculated.playerStats);
        } else {
          // Empty init
          const empty = recalcAll([], null);
          setTeamStats(empty.teamStats);
          setAllPlayerStats(empty.playerStats);
        }
      } catch (e) {
        console.error("Hydration error:", e);
        // Fallback to empty state on error
        const empty = recalcAll([], null);
        setTeamStats(empty.teamStats);
        setAllPlayerStats(empty.playerStats);
      } finally {
        setHydrated(true);
      }
    }

    init();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (phase === 'setup') {
      localStorage.removeItem(STORAGE_KEY);
      clearFirebaseState();
      return;
    }
    try {
      const stateData = {
        userName, userTeam, tourney, schedule, results, phase, playoff, playoffStep, champion, godModeMatches, usedPlayoffGodMode, history, careerRivalries
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateData));
      saveStateToFirebase(stateData);
    } catch { }
  }, [hydrated, userName, userTeam, tourney, schedule, results, phase, playoff, playoffStep, champion, godModeMatches, usedPlayoffGodMode, history, careerRivalries]);

  const playersMap = useMemo(() => userName ? buildAllPlayers(userName, userTeam) : {}, [userName, userTeam]);

  function startTournament(name, tournamentName, teamId) {
    const sched = generateSchedule();
    setUserName(name);
    setUserTeam(teamId);
    setTourney(tournamentName);
    setSchedule(sched);
    setResults([]);
    setPhase('league');
    setPlayoff({ q1: null, elim: null, q2: null, final: null });
    setPlayoffStep(0);
    setChampion(null);
    setPendingToss(null);
    setGodModeMatches(pickGodModeMatches(sched, teamId, GOD_MODE_MIN, GOD_MODE_MAX));
    setGodAlerts([]);
    setUsedPlayoffGodMode(false);

    const empty = recalcAll([], name);
    setTeamStats(empty.teamStats);
    setAllPlayerStats(empty.playerStats);
  }

  function reset() {
    let nextHistory = history;
    if (phase === 'done' && champion) {
      const currentSeason = history.length + 1;
      const orangeCapPlayer = Object.values(allPlayerStats).sort((a, b) => b.runs - a.runs)[0];
      const purpleCapPlayer = Object.values(allPlayerStats).sort((a, b) => b.wkts - a.wkts)[0];

      const userKey = `USER:${userName}`;
      const userStats = allPlayerStats[userKey] || { runs: 0, balls: 0, wkts: 0, runsConceded: 0, ballsBowled: 0, outs: 0 };
      const overs = userStats.ballsBowled / 6;
      const userEcon = overs > 0 ? (userStats.runsConceded / overs).toFixed(2) : 0;
      const userSR = userStats.balls > 0 ? ((userStats.runs / userStats.balls) * 100).toFixed(1) : 0;

      const newEntry = {
        season: currentSeason,
        champion,
        orangeCap: { name: orangeCapPlayer?.player?.name || 'Unknown', runs: orangeCapPlayer?.runs || 0 },
        purpleCap: { name: purpleCapPlayer?.player?.name || 'Unknown', wickets: purpleCapPlayer?.wkts || 0 },
        playerStats: {
          M: userStats.M || 0,
          runs: userStats.runs || 0,
          balls: userStats.balls || 0,
          fifties: userStats.fifties || 0,
          hundreds: userStats.hundreds || 0,
          hs: userStats.HS || 0,
          outs: userStats.outs || 0,
          wickets: userStats.wkts || 0,
          runsConceded: userStats.runsConceded || 0,
          ballsBowled: userStats.ballsBowled || 0
        }
      };
      nextHistory = [...history, newEntry];
      setHistory(nextHistory);

      // Accumulate Rivalries
      const nextRivalries = { ...careerRivalries };
      const allSeasonMatches = [
        ...results,
        ...[playoff.q1, playoff.elim, playoff.q2, playoff.final].filter(Boolean)
      ];
      allSeasonMatches.forEach(m => {
        if (m.home === userTeam || m.away === userTeam) {
          const isHome = m.home === userTeam;
          const opp = isHome ? m.away : m.home;
          const won = m.winner === userTeam;
          if (!nextRivalries[opp]) nextRivalries[opp] = { wins: 0, losses: 0 };
          if (won) nextRivalries[opp].wins += 1;
          else nextRivalries[opp].losses += 1;
        }
      });
      setCareerRivalries(nextRivalries);

      // Preserve history and rivalries when clearing storage for a new season
      const data = { history: nextHistory, careerRivalries: nextRivalries };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      saveStateToFirebase(data);
    } else {
      const data = { history, careerRivalries };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      saveStateToFirebase(data);
    }

    setUserName(null);
    setSchedule([]);
    setResults([]);
    setPhase('setup');
    setPlayoff({ q1: null, elim: null, q2: null, final: null });
    setPlayoffStep(0);
    setChampion(null);
    setPendingToss(null);
    setOpenMatch(null);
    setGodModeMatches([]);
    setGodAlerts([]);
    setUsedPlayoffGodMode(false);
    setTeamStats({});
    setAllPlayerStats({});
  }

  function opponentOf(match) {
    if (match.home === userTeam) return match.away;
    if (match.away === userTeam) return match.home;
    return null;
  }

  function applyMatchStats(match) {
    const next = accumulateMatchStats(teamStats, allPlayerStats, match, userName);
    setTeamStats(next.teamStats);
    setAllPlayerStats(next.playerStats);
  }

  function commitLeagueMatch(match) {
    applyMatchStats(match);
    setResults(r => {
      const newResults = [...r, match];
      if (newResults.length >= schedule.length) setPhase('playoffs');
      return newResults;
    });
  }

  function simulateLeagueBatch(startIdx, count) {
    const batch = [];
    const alerts = [];
    let currentTeamStats = teamStats;
    let currentPlayerStats = allPlayerStats;

    for (let i = 0; i < count; i++) {
      const idx = startIdx + i;
      const next = schedule[idx];
      const godMode = godModeMatches.includes(idx);
      const match = simulateMatch(next.home, next.away, userName, userTeam, playersMap, 'League', null, null, godMode);
      batch.push(match);

      const acc = accumulateMatchStats(currentTeamStats, currentPlayerStats, match, userName);
      currentTeamStats = acc.teamStats;
      currentPlayerStats = acc.playerStats;

      if (godMode) {
        alerts.push({ matchNum: idx + 1, opp: opponentOf(next) });
      }
    }

    setTeamStats(currentTeamStats);
    setAllPlayerStats(currentPlayerStats);
    return { batch, alerts };
  }

  function simNext() {
    if (results.length >= schedule.length) return;
    const idx = results.length;
    const next = schedule[idx];
    const { tossWinner, tossDecision } = rollToss(next.home, next.away);
    const isUserPlaying = next.home === userTeam || next.away === userTeam;
    const godMode = godModeMatches.includes(idx);

    if (isUserPlaying && tossWinner === userTeam) {
      setPendingToss({ home: next.home, away: next.away, tossWinner, label: 'League', type: 'league', godMode });
      return;
    }

    const match = simulateMatch(next.home, next.away, userName, userTeam, playersMap, 'League', tossWinner, tossDecision, godMode);
    commitLeagueMatch(match);
    if (godMode) {
      setGodAlerts(a => [...a, { matchNum: idx + 1, opp: opponentOf(next) }]);
    }
  }

  function sim10() {
    const count = Math.min(10, schedule.length - results.length);
    const { batch, alerts } = simulateLeagueBatch(results.length, count);
    setResults(r => {
      const all = [...r, ...batch];
      if (all.length >= schedule.length) setPhase('playoffs');
      return all;
    });
    if (alerts.length > 0) setGodAlerts(a => [...a, ...alerts]);
  }

  function simAll() {
    const count = schedule.length - results.length;
    const { batch, alerts } = simulateLeagueBatch(results.length, count);
    setResults(r => {
      const all = [...r, ...batch];
      if (all.length >= schedule.length) setPhase('playoffs');
      return all;
    });
    if (alerts.length > 0) setGodAlerts(a => [...a, ...alerts]);
  }

  function applyPlayoffMatch(match, step) {
    applyMatchStats(match);
    if (step === 0) {
      setPlayoff(p => ({ ...p, q1: match }));
      setPlayoffStep(1);
    } else if (step === 1) {
      setPlayoff(p => ({ ...p, elim: match }));
      setPlayoffStep(2);
    } else if (step === 2) {
      setPlayoff(p => ({ ...p, q2: match }));
      setPlayoffStep(3);
    } else if (step === 3) {
      setPlayoff(p => ({ ...p, final: match }));
      setChampion(match.winner);
      setPhase('done');
      setTab('playoffs');
    }
  }

  function simPlayoff() {
    const table = Object.entries(teamStats)
      .map(([id, s]) => ({ id, ...s, NRR: computeNRR(s) }))
      .sort((a, b) => b.Pts - a.Pts || b.NRR - a.NRR);

    const [t1, t2, t3, t4] = table.slice(0, 4).map(t => t.id);

    let home, away, label;
    if (playoffStep === 0) { home = t1; away = t2; label = 'Qualifier 1'; }
    else if (playoffStep === 1) { home = t3; away = t4; label = 'Eliminator'; }
    else if (playoffStep === 2) {
      home = playoff.q1.winner === playoff.q1.home ? playoff.q1.away : playoff.q1.home;
      away = playoff.elim.winner;
      label = 'Qualifier 2';
    } else if (playoffStep === 3) {
      home = playoff.q1.winner;
      away = playoff.q2.winner;
      label = 'Final';
    } else {
      return;
    }

    const { tossWinner, tossDecision } = rollToss(home, away);
    const isUserPlaying = home === userTeam || away === userTeam;

    let isGodMode = false;
    if (isUserPlaying && !usedPlayoffGodMode) {
      if (playoffStep === 3 || Math.random() < 0.5) {
        isGodMode = true;
        setUsedPlayoffGodMode(true);
      }
    }

    if (isUserPlaying && tossWinner === userTeam) {
      setPendingToss({ home, away, tossWinner, label, type: 'playoff', step: playoffStep, godMode: isGodMode });
      return;
    }

    const match = simulateMatch(home, away, userName, userTeam, playersMap, label, tossWinner, tossDecision, isGodMode);
    applyPlayoffMatch(match, playoffStep);
    if (isGodMode) {
      setGodAlerts(a => [...a, { matchNum: label, opp: opponentOf({ home, away }) }]);
    }
  }

  function completeToss(decision) {
    if (!pendingToss) return;
    const { home, away, tossWinner, label, type, step, godMode } = pendingToss;
    const match = simulateMatch(home, away, userName, userTeam, playersMap, label, tossWinner, decision, !!godMode);
    setPendingToss(null);

    if (type === 'league') {
      commitLeagueMatch(match);
      if (godMode) {
        const idx = results.length;
        setGodAlerts(a => [...a, { matchNum: idx + 1, opp: opponentOf({ home, away }) }]);
      }
    } else {
      applyPlayoffMatch(match, step);
      if (godMode) {
        setGodAlerts(a => [...a, { matchNum: label, opp: opponentOf({ home, away }) }]);
      }
    }
  }

  return {
    state: {
      userName, userTeam, tourney, schedule, results, phase, tab, playoff, playoffStep, champion,
      openMatch, pendingToss, godModeMatches, godAlerts, hydrated,
      teamStats, allPlayerStats, history, careerRivalries, usedPlayoffGodMode
    },
    setters: {
      setTab, setOpenMatch, setGodAlerts
    },
    actions: {
      startTournament, reset, simNext, sim10, simAll, simPlayoff, completeToss
    }
  };
}
