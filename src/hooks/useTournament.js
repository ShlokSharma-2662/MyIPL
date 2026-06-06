import { useState, useMemo, useEffect } from 'react';
import { buildAllPlayers, ROSTERS } from '../data';
import { GOD_MODE_MIN, GOD_MODE_MAX, TOSS_FIELD_FIRST_PROB } from '../constants';
import { simulateMatch, generateSchedule, pickGodModeMatches } from '../simulation';
import { recalcAll, accumulateMatchStats, computeNRR, recalcAllInternational } from '../stats';
import { generateInternationalSchedule, INTERNATIONAL_ROSTERS, INTERNATIONAL_TEAMS } from '../internationalData';
import { FORMATS } from '../formats';
import { LEGACY_HISTORY, LEGACY_RIVALRIES } from '../historyData';
import { getGameState, saveGameState, clearGameState } from '../api';

const STORAGE_KEY = 'ipl_sim_state_v2'; // Increment to avoid state collision

const DEFAULT_HALL_OF_FAME = {
  highestTeamTotal: { runs: 277, wickets: 3, team: 'SRH', opponent: 'MI', season: 8 },
  lowestTeamTotal: { runs: 49, wickets: 10, team: 'RCB', opponent: 'KKR', season: 4 },
  highestUserRuns: { runs: 85, balls: 41, opponent: 'MI', season: 'Career Start' },
  bestUserBowling: { wickets: 4, runs: 18, opponent: 'RCB', season: 'Career Start' },
  mostUserSixesInMatch: { sixes: 6, opponent: 'KKR', season: 'Career Start' },
  fastestFifty: { balls: 13, player: 'Yashasvi Jaiswal', team: 'RR', season: 7 }
};

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

  // Preview & Live Watch states
  const [activePreview, setActivePreview] = useState(null);
  const [liveMatch, setLiveMatch] = useState(null);
  const [pendingTactics, setPendingTactics] = useState(null);

  // Persistent achievements & records
  const [hallOfFame, setHallOfFame] = useState(DEFAULT_HALL_OF_FAME);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [fanPopularity, setFanPopularity] = useState(80);

  // Dynamic Expansion Pack RPG states
  const [playerXP, setPlayerXP] = useState(0);
  const [userPlayerAttributes, setUserPlayerAttributes] = useState({
    power: 1, timing: 1, spinDef: 1, paceDef: 1, deathBowl: 1, economy: 1
  });
  const [activeSponsor, setActiveSponsor] = useState(null);
  const [clt20Active, setClt20Active] = useState(false);
  const [teamHistoricTitles, setTeamHistoricTitles] = useState({
    CSK: 5, MI: 5, KKR: 3, SRH: 2, DC: 0, RR: 1, PBKS: 0, GT: 1, LSG: 0
  });
  const [rosterVersion, setRosterVersion] = useState(0);

  // Incremental stats state
  const [teamStats, setTeamStats] = useState({});
  const [allPlayerStats, setAllPlayerStats] = useState({});
  
  const [history, setHistory] = useState(LEGACY_HISTORY);
  const [careerRivalries, setCareerRivalries] = useState(LEGACY_RIVALRIES);

  const [internationalActive, setInternationalActive] = useState(false);
  const [internationalSchedule, setInternationalSchedule] = useState([]);
  const [internationalResults, setInternationalResults] = useState([]);
  const [internationalPlayerStats, setInternationalPlayerStats] = useState({});

  useEffect(() => {
    async function init() {
      try {
        let saved = await getGameState();
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
          
          if (saved.careerRivalries) setCareerRivalries(saved.careerRivalries);
          if (saved.history) {
            const mergedHistory = saved.history.map(s => {
              const legacyMatch = LEGACY_HISTORY.find(lh => lh.season === s.season);
              if (legacyMatch) {
                return { ...s, formatStats: s.formatStats || legacyMatch.formatStats };
              }
              return s;
            });
            setHistory(mergedHistory);
          }
          if (saved.hallOfFame) setHallOfFame(saved.hallOfFame);
          if (saved.unlockedAchievements) setUnlockedAchievements(saved.unlockedAchievements);
          if (saved.fanPopularity !== undefined) setFanPopularity(saved.fanPopularity);
          
          if (saved.playerXP !== undefined) setPlayerXP(saved.playerXP);
          if (saved.userPlayerAttributes) setUserPlayerAttributes(saved.userPlayerAttributes);
          if (saved.activeSponsor) setActiveSponsor(saved.activeSponsor);
          if (saved.clt20Active !== undefined) setClt20Active(saved.clt20Active);
          if (saved.teamHistoricTitles) setTeamHistoricTitles(saved.teamHistoricTitles);
          
          if (saved.internationalActive !== undefined) setInternationalActive(saved.internationalActive);
          if (saved.internationalSchedule) setInternationalSchedule(saved.internationalSchedule);
          if (saved.internationalResults) setInternationalResults(saved.internationalResults);
          if (saved.internationalPlayerStats) setInternationalPlayerStats(saved.internationalPlayerStats);
          
          if (saved.customRosters) {
            Object.keys(saved.customRosters).forEach(teamId => {
              const raw = saved.customRosters[teamId];
              // Firebase can mangle nested arrays into objects with numeric keys — coerce back to arrays
              if (Array.isArray(raw)) {
                ROSTERS[teamId] = raw.map(entry => Array.isArray(entry) ? entry : Object.values(entry));
              }
            });
          }
          
          const allMatches = [
            ...(saved.results || []),
            ...[saved.playoff?.q1, saved.playoff?.elim, saved.playoff?.q2, saved.playoff?.final].filter(Boolean),
          ];
          const recalculated = recalcAll(allMatches, saved.userName, saved.userTeam || 'CSK');
          setTeamStats(recalculated.teamStats);
          setAllPlayerStats(recalculated.playerStats);
        } else {
          // Restore achievements from old local store if v2 is empty
          try {
            const legacySaved = JSON.parse(localStorage.getItem('ipl_sim_state_v1'));
            if (legacySaved) {
              if (legacySaved.history) setHistory(legacySaved.history);
              if (legacySaved.careerRivalries) setCareerRivalries(legacySaved.careerRivalries);
              if (legacySaved.hallOfFame) setHallOfFame(legacySaved.hallOfFame);
              if (legacySaved.unlockedAchievements) setUnlockedAchievements(legacySaved.unlockedAchievements);
            }
          } catch {}

          const empty = recalcAll([], null);
          setTeamStats(empty.teamStats);
          setAllPlayerStats(empty.playerStats);
        }
      } catch (e) {
        console.error("Hydration error:", e);
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
      clearGameState();
      return;
    }
    try {
      // Completely strip commentary events from all past matches to keep database footprint practically zero
      const sanitizedResults = results.map(m => ({
        ...m,
        inn1: { ...m.inn1, events: [] },
        inn2: { ...m.inn2, events: [] }
      }));

      const sanitizedPlayoff = {
        q1: playoff.q1 ? { ...playoff.q1, inn1: { ...playoff.q1.inn1, events: [] }, inn2: { ...playoff.q1.inn2, events: [] } } : null,
        elim: playoff.elim ? { ...playoff.elim, inn1: { ...playoff.elim.inn1, events: [] }, inn2: { ...playoff.elim.inn2, events: [] } } : null,
        q2: playoff.q2 ? { ...playoff.q2, inn1: { ...playoff.q2.inn1, events: [] }, inn2: { ...playoff.q2.inn2, events: [] } } : null,
        final: playoff.final ? { ...playoff.final, inn1: { ...playoff.final.inn1, events: [] }, inn2: { ...playoff.final.inn2, events: [] } } : null,
      };

      const customRosters = {
        CSK: ROSTERS.CSK,
        MI: ROSTERS.MI,
        RCB: ROSTERS.RCB,
        KKR: ROSTERS.KKR,
        SRH: ROSTERS.SRH,
        DC: ROSTERS.DC,
        RR: ROSTERS.RR,
        PBKS: ROSTERS.PBKS,
        GT: ROSTERS.GT,
        LSG: ROSTERS.LSG
      };
      // Sanitize international results to remove commentary events before saving
      const sanitizedIntResults = (internationalResults || []).map(m => ({
        ...m,
        inn1: { ...m.inn1, events: [] },
        inn2: { ...m.inn2, events: [] },
        inn3: m.inn3 ? { ...m.inn3, events: [] } : null,
        inn4: m.inn4 ? { ...m.inn4, events: [] } : null,
      }));

      const stateData = {
        userName, userTeam, tourney, schedule,
        results: sanitizedResults,
        phase,
        playoff: sanitizedPlayoff,
        playoffStep, champion, godModeMatches, usedPlayoffGodMode, history, careerRivalries, hallOfFame, unlockedAchievements, fanPopularity,
        playerXP, userPlayerAttributes, activeSponsor, clt20Active, teamHistoricTitles,
        customRosters,
        internationalActive,
        internationalSchedule,
        internationalResults: sanitizedIntResults,
        internationalPlayerStats
      };
      // Save the full state to localStorage (offline cache) and the backend.
      // Postgres stores JSON, so customRosters (nested arrays) round-trips fine.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateData));
      saveGameState(stateData);
    } catch {}
  }, [hydrated, userName, userTeam, tourney, schedule, results, phase, playoff, playoffStep, champion, godModeMatches, usedPlayoffGodMode, history, careerRivalries, hallOfFame, unlockedAchievements, fanPopularity, playerXP, userPlayerAttributes, activeSponsor, clt20Active, teamHistoricTitles, rosterVersion, internationalActive, internationalSchedule, internationalResults, internationalPlayerStats]);

  const playersMap = useMemo(() => {
    if (!userName) return {};
    const baseMap = buildAllPlayers(userName, userTeam);
    
    // Add international rosters to playersMap
    for (const teamId of Object.keys(INTERNATIONAL_ROSTERS)) {
      INTERNATIONAL_ROSTERS[teamId].forEach(tup => {
        const [name, role, batSR, batAvg, bowlSR, bowlEcon] = tup;
        baseMap[`${teamId}:${name}`] = {
          name, role, team: teamId,
          batSR, batAvg,
          bowls: bowlSR !== null,
          bowlSR: bowlSR || 0,
          bowlEcon: bowlEcon || 0,
        };
      });
    }

    const userKey = `USER:${userName}`;
    if (baseMap[userKey] && userPlayerAttributes) {
      const { power, timing, spinDef, paceDef, deathBowl, economy } = userPlayerAttributes;
      
      baseMap[userKey].batSR = 148 + (power - 1) * 8;
      baseMap[userKey].batAvg = 35 + (timing - 1) * 5;
      baseMap[userKey].batAvg += (spinDef - 1) * 1.5 + (paceDef - 1) * 1.5;
      
      baseMap[userKey].bowlSR = Math.max(10, 18 - (deathBowl - 1) * 1.5);
      baseMap[userKey].bowlEcon = Math.max(5.0, 8.2 - (economy - 1) * 0.45);
    }
    return baseMap;
  }, [userName, userTeam, userPlayerAttributes, rosterVersion]);

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
    setActivePreview(null);
    setLiveMatch(null);
    setPendingTactics(null);
    
    // Set base popularity based on team choices
    const basePops = { CSK: 85, MI: 82, RCB: 80, KKR: 78, SRH: 72, DC: 70, RR: 72, PBKS: 65, GT: 68, LSG: 65 };
    setFanPopularity(basePops[teamId] || 70);
    
    const empty = recalcAll([], name, teamId);
    setTeamStats(empty.teamStats);
    setAllPlayerStats(empty.playerStats);
  }

  function reset() {
    let nextHistory = history;
    let nextHallOfFame = { ...hallOfFame };
    let nextAchievements = [...unlockedAchievements];

    if (phase === 'done' && champion) {
      const currentSeason = history.length + 1;
      const orangeCapPlayer = Object.values(allPlayerStats).sort((a, b) => b.runs - a.runs)[0];
      const purpleCapPlayer = Object.values(allPlayerStats).sort((a, b) => b.wkts - a.wkts)[0];
      
      const userKey = `USER:${userName}`;
      const userStats = allPlayerStats[userKey] || { runs: 0, balls: 0, wkts: 0, runsConceded: 0, ballsBowled: 0, outs: 0 };

      const getStatsForFormat = (matches, formatFilter) => {
        let M = 0;
        let runs = 0;
        let outs = 0;
        let balls = 0;
        let HS = 0;
        let hundreds = 0;
        let fifties = 0;
        let wkts = 0;
        let ballsBowled = 0;
        let runsConceded = 0;

        (matches || []).forEach(m => {
          if (formatFilter && m.format !== formatFilter) return;

          const userBatEntries = [
            ...m.inn1.battersCard, 
            ...m.inn2.battersCard, 
            ...(m.inn3?.battersCard || []), 
            ...(m.inn4?.battersCard || [])
          ].filter(b => b.player.isUser);

          const userBowlEntries = [
            ...m.inn1.bowlersCard, 
            ...m.inn2.bowlersCard, 
            ...(m.inn3?.bowlersCard || []), 
            ...(m.inn4?.bowlersCard || [])
          ].filter(b => b.player.isUser);

          if (userBatEntries.length > 0 || userBowlEntries.length > 0) {
            M++;
            
            userBatEntries.forEach(b => {
              runs += b.runs;
              if (b.out) outs++;
              balls += b.balls;
              if (b.runs > HS) HS = b.runs;
              if (b.runs >= 100) hundreds++;
              else if (b.runs >= 50) fifties++;
            });

            userBowlEntries.forEach(b => {
              wkts += b.wickets;
              ballsBowled += b.balls || 0;
              runsConceded += b.runs || 0;
            });
          }
        });

        return {
          M,
          runs,
          balls,
          outs,
          hs: HS,
          hundreds,
          fifties,
          wickets: wkts,
          ballsBowled,
          runsConceded
        };
      };

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
        },
        formatStats: {
          IPL: {
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
          },
          T20I: getStatsForFormat(internationalResults, 'T20'),
          ODI: getStatsForFormat(internationalResults, 'ODI'),
          TEST: getStatsForFormat(internationalResults, 'TEST')
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

      // Scan season matches for Hall of Fame records & Achievements
      let wonAllGodMatches = true;
      let hasCenturion = false;
      let hasFiveWkt = false;

      // Verify God matches performance
      godModeMatches.forEach(idx => {
        const m = results[idx];
        if (m && m.winner !== userTeam) wonAllGodMatches = false;
      });

      allSeasonMatches.forEach(m => {
        // Achievements checks
        const firstBatUser = m.inn1.battersCard.find(b => b.player.isUser);
        const secondBatUser = m.inn2.battersCard.find(b => b.player.isUser);
        if ((firstBatUser && firstBatUser.runs >= 100) || (secondBatUser && secondBatUser.runs >= 100)) {
          hasCenturion = true;
        }

        const firstBowlUser = m.inn1.bowlersCard.find(b => b.player.isUser);
        const secondBowlUser = m.inn2.bowlersCard.find(b => b.player.isUser);
        if ((firstBowlUser && firstBowlUser.wickets >= 5) || (secondBowlUser && secondBowlUser.wickets >= 5)) {
          hasFiveWkt = true;
        }

        // Record scans for Team totals
        const checkTotal = (runs, wickets, team, opponent) => {
          if (runs > nextHallOfFame.highestTeamTotal.runs) {
            nextHallOfFame.highestTeamTotal = { runs, wickets, team, opponent, season: currentSeason };
          }
          if (runs < nextHallOfFame.lowestTeamTotal.runs && wickets === 10) {
            nextHallOfFame.lowestTeamTotal = { runs, wickets, team, opponent, season: currentSeason };
          }
        };
        checkTotal(m.inn1.totalRuns, m.inn1.wickets, m.battingFirst, m.battingSecond);
        checkTotal(m.inn2.totalRuns, m.inn2.wickets, m.battingSecond, m.battingFirst);

        // Record scans for User individual stats
        const checkUserBat = (b) => {
          if (b.runs > nextHallOfFame.highestUserRuns.runs) {
            nextHallOfFame.highestUserRuns = { runs: b.runs, balls: b.balls, opponent: m.home === userTeam ? m.away : m.home, season: currentSeason };
          }
          if (b.sixes > nextHallOfFame.mostUserSixesInMatch.sixes) {
            nextHallOfFame.mostUserSixesInMatch = { sixes: b.sixes, opponent: m.home === userTeam ? m.away : m.home, season: currentSeason };
          }
        };
        const checkUserBowl = (b) => {
          const better = b.wickets > nextHallOfFame.bestUserBowling.wickets || 
                         (b.wickets === nextHallOfFame.bestUserBowling.wickets && b.runs < nextHallOfFame.bestUserBowling.runs);
          if (better) {
            nextHallOfFame.bestUserBowling = { wickets: b.wickets, runs: b.runs, opponent: m.home === userTeam ? m.away : m.home, season: currentSeason };
          }
        };

        [...m.inn1.battersCard, ...m.inn2.battersCard].forEach(b => {
          if (b.player.isUser) checkUserBat(b);
          if (b.runs >= 50 && b.balls < nextHallOfFame.fastestFifty.balls) {
            nextHallOfFame.fastestFifty = { balls: b.balls, player: b.player.name, team: b.player.team, season: currentSeason };
          }
        });
        [...m.inn1.bowlersCard, ...m.inn2.bowlersCard].forEach(b => {
          if (b.player.isUser) checkUserBowl(b);
        });
      });

      // Committing achievements
      if (champion === userTeam && !nextAchievements.includes('IPL_CHAMPION')) nextAchievements.push('IPL_CHAMPION');
      if (orangeCapPlayer?.player?.isUser && !nextAchievements.includes('ORANGE_CAP')) nextAchievements.push('ORANGE_CAP');
      if (purpleCapPlayer?.player?.isUser && !nextAchievements.includes('PURPLE_CAP')) nextAchievements.push('PURPLE_CAP');
      if (hasCenturion && !nextAchievements.includes('CENTURION')) nextAchievements.push('CENTURION');
      if (hasFiveWkt && !nextAchievements.includes('FIVE_WICKET_HAUL')) nextAchievements.push('FIVE_WICKET_HAUL');
      if (wonAllGodMatches && godModeMatches.length > 0 && !nextAchievements.includes('GOD_MODE_MASTER')) nextAchievements.push('GOD_MODE_MASTER');

      setHallOfFame(nextHallOfFame);
      setUnlockedAchievements(nextAchievements);

      const data = { 
        history: nextHistory, 
        careerRivalries: nextRivalries,
        hallOfFame: nextHallOfFame,
        unlockedAchievements: nextAchievements
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      saveGameState(data);
    } else {
      const data = { history, careerRivalries, hallOfFame, unlockedAchievements };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      saveGameState(data);
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
    setActivePreview(null);
    setLiveMatch(null);
    setPendingTactics(null);
  }

  function opponentOf(match) {
    if (match.home === userTeam) return match.away;
    if (match.away === userTeam) return match.home;
    return null;
  }

  function applyMatchStats(match) {
    const next = accumulateMatchStats(teamStats, allPlayerStats, match, userName, userTeam);
    setTeamStats(next.teamStats);
    setAllPlayerStats(next.playerStats);
  }

  function updatePopularityAfterMatch(m) {
    if (m.home !== userTeam && m.away !== userTeam) return; // Only user team matches affect fan base
    const won = m.winner === userTeam;
    const opp = m.home === userTeam ? m.away : m.home;
    const isDerby = ['CSK', 'MI', 'RCB'].includes(opp) && ['CSK', 'MI', 'RCB'].includes(userTeam);
    
    let delta = 0;
    if (won) {
      delta += isDerby ? 5 : 2.5;
      if (m.godMode) delta += 4; // God Mode hype!
    } else {
      delta -= isDerby ? 4 : 2;
    }

    // Check user milestones
    const userBat = [...m.inn1.battersCard, ...m.inn2.battersCard].find(b => b.player.isUser);
    const userBowl = [...m.inn1.bowlersCard, ...m.inn2.bowlersCard].find(b => b.player.isUser);
    
    if (userBat) {
      if (userBat.runs >= 100) delta += 4;
      else if (userBat.runs >= 50) delta += 2;
      else if (userBat.runs === 0 && userBat.out) delta -= 1.5; // Duck disappoints fans
    }
    if (userBowl) {
      if (userBowl.wickets >= 5) delta += 4;
      else if (userBowl.wickets >= 3) delta += 2;
    }

    setFanPopularity(p => Math.max(10, Math.min(100, Math.round(p + delta))));
  }

  function checkSponsorProgress(m) {
    if (!activeSponsor) return;
    let nextSponsor = { ...activeSponsor };
    let completed = false;
    
    const userBat = [...m.inn1.battersCard, ...m.inn2.battersCard].find(b => b.player.isUser);
    const userBowl = [...m.inn1.bowlersCard, ...m.inn2.bowlersCard].find(b => b.player.isUser);
    
    if (activeSponsor.id === 'apex') {
      if (userBat) {
        nextSponsor.progress = (nextSponsor.progress || 0) + userBat.runs;
        if (nextSponsor.progress >= 150) completed = true;
      }
    } else if (activeSponsor.id === 'aura') {
      if (userBowl) {
        nextSponsor.progress = (nextSponsor.progress || 0) + userBowl.wickets;
        if (nextSponsor.progress >= 10) completed = true;
      }
    } else if (activeSponsor.id === 'neon') {
      const won = m.winner === userTeam;
      if (won) {
        nextSponsor.progress = (nextSponsor.progress || 0) + 1;
        if (nextSponsor.progress >= 8) completed = true;
      }
    }
    
    if (completed && !nextSponsor.claimed) {
      nextSponsor.claimed = true;
      setPlayerXP(x => x + 250); 
      setFanPopularity(p => Math.min(100, p + 10)); 
    }
    setActiveSponsor(nextSponsor);
  }

  function startChampionsLeague() {
    setClt20Active(true);
    setPhase('league');
    setTab('table');
    setTourney('CLT20 Champions League');
    setResults([]);
    
    const cltTeams = ['CSK', 'S6', 'TKR', 'LS', 'JS', 'AA'];
    const cltSched = [];
    for (let i = 0; i < cltTeams.length; i++) {
      for (let j = i + 1; j < cltTeams.length; j++) {
        cltSched.push({ home: cltTeams[i], away: cltTeams[j] });
      }
    }
    setSchedule(cltSched);
    
    const empty = recalcAll([], userName, userTeam);
    setTeamStats(empty.teamStats);
    setAllPlayerStats(empty.playerStats);
  }

  function commitLeagueMatch(match) {
    applyMatchStats(match);
    updatePopularityAfterMatch(match);
    checkSponsorProgress(match);
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
      
      const acc = accumulateMatchStats(currentTeamStats, currentPlayerStats, match, userName, userTeam);
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

  function startInternationalSeason() {
    setInternationalActive(true);
    setTourney("International Season (Rest of Year)");
    setPhase("league");
    setTab("international");
    setInternationalResults([]);
    setInternationalPlayerStats({});
    const intSched = generateInternationalSchedule();
    setInternationalSchedule(intSched);
  }

  function completeInternationalSeason() {
    setInternationalActive(false);
    reset();
  }

  function commitInternationalMatch(match) {
    setInternationalResults(r => {
      const newResults = [...r, match];
      const parsed = recalcAllInternational(newResults, userName);
      setInternationalPlayerStats(parsed);
      
      if (newResults.length >= internationalSchedule.length) {
        setPhase('done');
        setTab('international');
      }
      return newResults;
    });
  }

  function simNextInternational() {
    if (internationalResults.length >= internationalSchedule.length) return;
    const idx = internationalResults.length;
    const next = internationalSchedule[idx];
    const { tossWinner, tossDecision } = rollToss(next.home, next.away);

    setActivePreview({
      home: next.home,
      away: next.away,
      idx,
      label: next.label,
      type: 'international',
      tossWinner,
      tossDecision,
      format: next.format,
      godMode: false
    });
  }

  function simulateInternationalBatch(startIdx, count) {
    const batch = [];
    for (let i = 0; i < count; i++) {
      const idx = startIdx + i;
      const next = internationalSchedule[idx];
      const matchConfig = FORMATS[next.format];
      const match = simulateMatch(next.home, next.away, userName, 'IND', playersMap, next.label, null, null, false, {}, {}, matchConfig, INTERNATIONAL_ROSTERS);
      batch.push(match);
    }
    return batch;
  }

  function simNext() {
    if (internationalActive) {
      simNextInternational();
      return;
    }
    if (results.length >= schedule.length) return;
    const idx = results.length;
    const next = schedule[idx];
    const { tossWinner, tossDecision } = rollToss(next.home, next.away);
    const isUserPlaying = next.home === userTeam || next.away === userTeam;
    const godMode = godModeMatches.includes(idx);

    if (isUserPlaying) {
      // Intercept and show visual preview
      setActivePreview({ 
        home: next.home, 
        away: next.away, 
        idx, 
        label: 'League', 
        type: 'league', 
        tossWinner, 
        tossDecision, 
        godMode 
      });
      return;
    }

    const match = simulateMatch(next.home, next.away, userName, userTeam, playersMap, 'League', tossWinner, tossDecision, godMode);
    commitLeagueMatch(match);
    if (godMode) {
      setGodAlerts(a => [...a, { matchNum: idx + 1, opp: opponentOf(next) }]);
    }
  }

  function simMyMatch() {
    if (internationalActive) {
      simNext();
      return;
    }
    if (results.length >= schedule.length) return;

    // Find the next unplayed match involving the user's team
    let nextUserIdx = -1;
    for (let i = results.length; i < schedule.length; i++) {
      if (schedule[i].home === userTeam || schedule[i].away === userTeam) {
        nextUserIdx = i;
        break;
      }
    }
    if (nextUserIdx === -1) return;

    // Batch-sim all matches before the user's match
    if (nextUserIdx > results.length) {
      const count = nextUserIdx - results.length;
      const { batch, alerts } = simulateLeagueBatch(results.length, count);
      setResults(r => {
        const all = [...r, ...batch];
        if (all.length >= schedule.length) setPhase('playoffs');
        return all;
      });
      if (alerts.length > 0) setGodAlerts(a => [...a, ...alerts]);
    }

    // Open the preview for the user's match
    const next = schedule[nextUserIdx];
    const { tossWinner, tossDecision } = rollToss(next.home, next.away);
    const godMode = godModeMatches.includes(nextUserIdx);
    setActivePreview({
      home: next.home,
      away: next.away,
      idx: nextUserIdx,
      label: 'League',
      type: 'league',
      tossWinner,
      tossDecision,
      godMode
    });
  }

  function sim10() {
    if (internationalActive) {
      const count = Math.min(10, internationalSchedule.length - internationalResults.length);
      const batch = simulateInternationalBatch(internationalResults.length, count);
      setInternationalResults(r => {
        const all = [...r, ...batch];
        const parsed = recalcAllInternational(all, userName);
        setInternationalPlayerStats(parsed);
        if (all.length >= internationalSchedule.length) setPhase('done');
        return all;
      });
      return;
    }
    const count = Math.min(10, schedule.length - results.length);
    const { batch, alerts } = simulateLeagueBatch(results.length, count);
    setResults(r => {
      const all = [...r, ...batch];
      if (all.length >= schedule.length) setPhase('playoffs');
      return all;
    });
    if (alerts.length > 0) setGodAlerts(a => [...a, ...alerts]);
  }

  // Intercept and launch a live watch or instant simulation from preview
  function executeLeagueMatch(preview, tactics, isLiveWatch) {
    setActivePreview(null);
    setPendingTactics({ tactics, isLiveWatch });
    
    // Open Toss modal
    setPendingToss({
      home: preview.home,
      away: preview.away,
      tossWinner: preview.tossWinner,
      tossDecision: preview.tossDecision,
      label: preview.label,
      type: preview.type, // 'league' or 'international'
      format: preview.format,
      godMode: preview.godMode
    });
  }

  function simAll() {
    if (internationalActive) {
      const count = internationalSchedule.length - internationalResults.length;
      const batch = simulateInternationalBatch(internationalResults.length, count);
      setInternationalResults(r => {
        const all = [...r, ...batch];
        const parsed = recalcAllInternational(all, userName);
        setInternationalPlayerStats(parsed);
        setPhase('done');
        return all;
      });
      return;
    }
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
    updatePopularityAfterMatch(match);
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
      setTeamHistoricTitles(prev => ({
        ...prev,
        [match.winner]: (prev[match.winner] || 0) + 1
      }));
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

    if (isUserPlaying) {
      setActivePreview({
        home,
        away,
        label,
        type: 'playoff',
        step: playoffStep,
        tossWinner,
        tossDecision,
        godMode: isGodMode
      });
      return;
    }

    const match = simulateMatch(home, away, userName, userTeam, playersMap, label, tossWinner, tossDecision, isGodMode);
    applyPlayoffMatch(match, playoffStep);
  }

  function executePlayoffMatch(preview, tactics, isLiveWatch) {
    setActivePreview(null);
    setPendingTactics({ tactics, isLiveWatch });

    setPendingToss({
      home: preview.home,
      away: preview.away,
      tossWinner: preview.tossWinner,
      tossDecision: preview.tossDecision,
      label: preview.label,
      type: preview.type || 'playoff',
      step: preview.step,
      godMode: preview.godMode,
      format: preview.format
    });
  }

  function completeToss(decision) {
    if (!pendingToss || !pendingTactics) return;
    
    const { home, away, tossWinner, label, type, step, godMode, format } = pendingToss;
    const { tactics, isLiveWatch } = pendingTactics;

    // Clear states
    setPendingToss(null);
    setPendingTactics(null);

    // Apply tactics only to the user team
    const isInternational = type === 'international' || internationalActive;
    const effectiveUserTeam = isInternational ? 'IND' : userTeam;
    const homeTactics = home === effectiveUserTeam ? tactics : {};
    const awayTactics = away === effectiveUserTeam ? tactics : {};

    // Simulate Match
    let match;
    if (isInternational) {
      const matchConfig = FORMATS[format || 'T20'];
      match = simulateMatch(home, away, userName, 'IND', playersMap, label, tossWinner, decision, false, homeTactics, awayTactics, matchConfig, INTERNATIONAL_ROSTERS);
    } else {
      match = simulateMatch(home, away, userName, userTeam, playersMap, label, tossWinner, decision, !!godMode, homeTactics, awayTactics);
    }

    if (isLiveWatch) {
      // Launch ball-by-ball viewer
      setLiveMatch({ match, type, step, format });
    } else {
      // Instant Sim commits directly
      if (type === 'international') {
        commitInternationalMatch(match);
      } else if (type === 'league') {
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
  }

  // Completing active live watch re-routes scorecard save to standings
  function completeLiveMatch(playedMatch) {
    const { type, step } = liveMatch;
    setLiveMatch(null);

    if (type === 'international') {
      commitInternationalMatch(playedMatch);
    } else if (type === 'league') {
      commitLeagueMatch(playedMatch);
      if (playedMatch.godMode) {
        const idx = results.length;
        setGodAlerts(a => [...a, { matchNum: idx + 1, opp: opponentOf({ home: playedMatch.home, away: playedMatch.away }) }]);
      }
    } else {
      applyPlayoffMatch(playedMatch, step);
      if (playedMatch.godMode) {
        setGodAlerts(a => [...a, { matchNum: playedMatch.label, opp: opponentOf({ home: playedMatch.home, away: playedMatch.away }) }]);
      }
    }
  }

  function executeTrade(targetTeamId, targetPlayerName, userPlayerName) {
    const userRoster = ROSTERS[userTeam] || [];
    const targetRoster = ROSTERS[targetTeamId] || [];

    const userIdx = userRoster.findIndex(p => p[0] === userPlayerName);
    const targetIdx = targetRoster.findIndex(p => p[0] === targetPlayerName);

    if (userIdx === -1 || targetIdx === -1) return false;

    // Perform swap in global ROSTERS structure
    const userPlayerTuple = [...userRoster[userIdx]];
    const targetPlayerTuple = [...targetRoster[targetIdx]];

    userRoster[userIdx] = targetPlayerTuple;
    targetRoster[targetIdx] = userPlayerTuple;

    ROSTERS[userTeam] = userRoster;
    ROSTERS[targetTeamId] = targetRoster;

    setRosterVersion(v => v + 1);

    // Recalculate stats dynamically for the updated lineup
    const allMatches = [
      ...results,
      ...[playoff.q1, playoff.elim, playoff.q2, playoff.final].filter(Boolean),
    ];
    const recalculated = recalcAll(allMatches, userName, userTeam);
    setTeamStats(recalculated.teamStats);
    setAllPlayerStats(recalculated.playerStats);

    return true;
  }

  return {
    state: {
      userName, userTeam, tourney, schedule, results, phase, tab, playoff, playoffStep, champion,
      openMatch, pendingToss, godModeMatches, godAlerts, hydrated,
      teamStats, allPlayerStats, history, careerRivalries, usedPlayoffGodMode,
      activePreview, liveMatch, hallOfFame, unlockedAchievements, fanPopularity,
      playerXP, userPlayerAttributes, activeSponsor, clt20Active, teamHistoricTitles,
      internationalActive, internationalSchedule, internationalResults, internationalPlayerStats
    },
    setters: {
      setTab, setOpenMatch, setGodAlerts, setActivePreview, setLiveMatch,
      setPlayerXP, setUserPlayerAttributes, setActiveSponsor, setClt20Active, setTeamHistoricTitles, setFanPopularity
    },
    actions: {
      startTournament, reset, simNext, simMyMatch, sim10, simAll, simPlayoff, completeToss,
      executeLeagueMatch, executePlayoffMatch, completeLiveMatch, executeTrade, startChampionsLeague,
      startInternationalSeason, completeInternationalSeason
    }
  };
}
