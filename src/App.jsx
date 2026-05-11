import React, { useState, useMemo, useEffect } from 'react';
import { buildAllPlayers } from './data';
import { USER_TEAM, TOSS_FIELD_FIRST_PROB, GOD_MODE_MIN, GOD_MODE_MAX } from './constants';
import { simulateMatch, generateSchedule, pickGodModeMatches } from './simulation';
import { recalcAll, computeNRR } from './stats';

import SetupScreen from './components/SetupScreen';
import ControlBar from './components/ControlBar';
import TabNav from './components/TabNav';
import PointsTable from './components/PointsTable';
import ResultsList from './components/ResultsList';
import StatsLeaderboards from './components/StatsLeaderboards';
import MyProfile from './components/MyProfile';
import PlayoffsView from './components/PlayoffsView';
import MatchDetailModal from './components/MatchDetailModal';
import TossModal from './components/TossModal';
import SeasonSummary from './components/SeasonSummary';
import GodModeAlert from './components/GodModeAlert';

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

export default function App() {
  const [userName, setUserName] = useState(null);
  const [tourney, setTourney] = useState('Shlok Premier League');
  const [schedule, setSchedule] = useState([]);
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState('setup'); // setup | league | playoffs | done
  const [tab, setTab] = useState('table');
  const [playoff, setPlayoff] = useState({ q1: null, elim: null, q2: null, final: null });
  const [playoffStep, setPlayoffStep] = useState(0);
  const [champion, setChampion] = useState(null);
  const [openMatch, setOpenMatch] = useState(null);
  const [pendingToss, setPendingToss] = useState(null); // { home, away, tossWinner, label, type, step? }
  const [godModeMatches, setGodModeMatches] = useState([]); // league match indices where god mode triggers
  const [godAlerts, setGodAlerts] = useState([]); // [{ matchNum, opp }]
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on first mount
  useEffect(() => {
    const saved = loadState();
    if (saved && saved.phase !== 'setup' && saved.userName) {
      setUserName(saved.userName);
      setTourney(saved.tourney);
      setSchedule(saved.schedule || []);
      setResults(saved.results || []);
      setPhase(saved.phase);
      setPlayoff(saved.playoff || { q1: null, elim: null, q2: null, final: null });
      setPlayoffStep(saved.playoffStep || 0);
      setChampion(saved.champion || null);
      setGodModeMatches(saved.godModeMatches || []);
    }
    setHydrated(true);
  }, []);

  // Persist on every meaningful change
  useEffect(() => {
    if (!hydrated) return;
    if (phase === 'setup') {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        userName, tourney, schedule, results, phase, playoff, playoffStep, champion, godModeMatches,
      }));
    } catch {
      // quota exceeded or similar — fail silently
    }
  }, [hydrated, userName, tourney, schedule, results, phase, playoff, playoffStep, champion, godModeMatches]);

  const playersMap = useMemo(() => userName ? buildAllPlayers(userName) : {}, [userName]);

  // Team stats from league results only (Points Table); player stats from all matches (incl playoffs).
  const teamStats = useMemo(() => {
    if (!userName) return {};
    return recalcAll(results, userName).teamStats;
  }, [results, userName]);

  const allPlayerStats = useMemo(() => {
    if (!userName) return {};
    const all = [
      ...results,
      ...[playoff.q1, playoff.elim, playoff.q2, playoff.final].filter(Boolean),
    ];
    return recalcAll(all, userName).playerStats;
  }, [results, playoff, userName]);

  // Scroll-to-top when tab changes
  useEffect(() => {
    if (phase === 'setup') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [tab, phase]);

  // Auto-switch tab when phase transitions
  useEffect(() => {
    if (phase === 'playoffs' && tab === 'table') setTab('playoffs');
    if (phase === 'done') setTab('playoffs');
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================
  // ACTIONS
  // ============================================================
  function startTournament(name, tournamentName) {
    const sched = generateSchedule();
    setUserName(name);
    setTourney(tournamentName);
    setSchedule(sched);
    setResults([]);
    setPhase('league');
    setPlayoff({ q1: null, elim: null, q2: null, final: null });
    setPlayoffStep(0);
    setChampion(null);
    setPendingToss(null);
    setGodModeMatches(pickGodModeMatches(sched, USER_TEAM, GOD_MODE_MIN, GOD_MODE_MAX));
    setGodAlerts([]);
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
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
  }

  // Returns the opponent team id for a CSK match, or null if CSK isn't playing.
  function opponentOf(match) {
    if (match.home === USER_TEAM) return match.away;
    if (match.away === USER_TEAM) return match.home;
    return null;
  }

  function commitLeagueMatch(match) {
    setResults(r => {
      const newResults = [...r, match];
      if (newResults.length >= schedule.length) setPhase('playoffs');
      return newResults;
    });
  }

  // Run a batch of league matches starting at `startIdx`, returning matches and the alerts queued.
  function simulateLeagueBatch(startIdx, count) {
    const batch = [];
    const alerts = [];
    for (let i = 0; i < count; i++) {
      const idx = startIdx + i;
      const next = schedule[idx];
      const godMode = godModeMatches.includes(idx);
      const match = simulateMatch(next.home, next.away, userName, playersMap, 'League', null, null, godMode);
      batch.push(match);
      if (godMode) {
        alerts.push({ matchNum: idx + 1, opp: opponentOf(next) });
      }
    }
    return { batch, alerts };
  }

  function simNext() {
    if (results.length >= schedule.length) return;
    const idx = results.length;
    const next = schedule[idx];
    const { tossWinner, tossDecision } = rollToss(next.home, next.away);
    const cskPlaying = next.home === USER_TEAM || next.away === USER_TEAM;
    const godMode = godModeMatches.includes(idx);

    if (cskPlaying && tossWinner === USER_TEAM) {
      setPendingToss({ home: next.home, away: next.away, tossWinner, label: 'League', type: 'league', godMode });
      return;
    }

    const match = simulateMatch(next.home, next.away, userName, playersMap, 'League', tossWinner, tossDecision, godMode);
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
      home = playoff.q1.winner === t1 ? t2 : t1;
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
    const cskPlaying = home === USER_TEAM || away === USER_TEAM;

    if (cskPlaying && tossWinner === USER_TEAM) {
      setPendingToss({ home, away, tossWinner, label, type: 'playoff', step: playoffStep });
      return;
    }

    const match = simulateMatch(home, away, userName, playersMap, label, tossWinner, tossDecision);
    applyPlayoffMatch(match, playoffStep);
  }

  function completeToss(decision) {
    if (!pendingToss) return;
    const { home, away, tossWinner, label, type, step, godMode } = pendingToss;
    const match = simulateMatch(home, away, userName, playersMap, label, tossWinner, decision, !!godMode);
    setPendingToss(null);

    if (type === 'league') {
      commitLeagueMatch(match);
      if (godMode) {
        const idx = results.length; // about-to-be-committed index
        setGodAlerts(a => [...a, { matchNum: idx + 1, opp: opponentOf({ home, away }) }]);
      }
    } else {
      applyPlayoffMatch(match, step);
    }
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen text-zinc-100" style={{
      background: 'radial-gradient(ellipse at top, #1a1208 0%, #0a0a0a 50%), #0a0a0a',
      fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    }}>
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[0.35em] text-amber-500 mb-1">FANTASY T20 SIMULATOR</div>
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.02em' }}>
              {tourney}
            </h1>
          </div>
          {userName && (
            <div className="text-right flex items-center gap-4">
              {godModeMatches.length > 0 && (
                <div className="hidden sm:block bg-gradient-to-br from-amber-500/20 to-fuchsia-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5 text-center">
                  <div className="text-[9px] tracking-[0.25em] text-amber-400 font-bold">⚡ GOD MODE</div>
                  <div className="text-xs font-mono text-zinc-200 font-bold">
                    {godModeMatches.filter(i => i >= results.length).length} / {godModeMatches.length} left
                  </div>
                </div>
              )}
              <div>
                <div className="text-[10px] tracking-[0.25em] text-zinc-500">PLAYING AS</div>
                <div className="text-lg font-bold text-amber-400">{userName}</div>
                <div className="text-[10px] text-zinc-500">CSK • OPENER</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {phase === 'setup' ? (
        <SetupScreen onStart={startTournament} />
      ) : (
        <>
          <ControlBar
            phase={phase}
            played={results.length}
            total={schedule.length}
            onSim={simNext}
            onSim10={sim10}
            onSimAll={simAll}
            onPlayoffs={simPlayoff}
            onReset={reset}
            playoffStep={playoffStep}
          />
          <TabNav tab={tab} setTab={setTab} />

          <main className="max-w-7xl mx-auto px-4 py-6">
            {phase === 'done' && tab === 'playoffs' && (
              <SeasonSummary
                champion={champion}
                allPlayerStats={allPlayerStats}
                userName={userName}
                tourney={tourney}
                onReset={reset}
              />
            )}
            {tab === 'table' && <PointsTable teamStats={teamStats} />}
            {tab === 'results' && <ResultsList results={results} onOpen={setOpenMatch} />}
            {tab === 'stats' && <StatsLeaderboards playerStats={allPlayerStats} />}
            {tab === 'me' && (
              <MyProfile
                userName={userName}
                results={[...results, playoff.q1, playoff.elim, playoff.q2, playoff.final].filter(Boolean)}
                playerStats={allPlayerStats}
              />
            )}
            {tab === 'playoffs' && <PlayoffsView playoff={playoff} onOpen={setOpenMatch} champion={champion} />}
          </main>
        </>
      )}

      <MatchDetailModal match={openMatch} onClose={() => setOpenMatch(null)} />
      <TossModal toss={pendingToss} onChoose={completeToss} />
      <GodModeAlert alerts={godAlerts} onDismiss={() => setGodAlerts([])} />
    </div>
  );
}
