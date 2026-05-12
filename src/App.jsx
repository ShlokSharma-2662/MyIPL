import React, { useEffect, useState } from 'react';
import { useTournament } from './hooks/useTournament';
import { auth, loginWithGoogle, logoutGoogle } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

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
import HistoryView from './components/HistoryView';

function MainApp({ user }) {
  const {
    state: {
      userName, userTeam, tourney, schedule, results, phase, tab, playoff, playoffStep, champion,
      openMatch, pendingToss, godModeMatches, godAlerts, hydrated,
      teamStats, allPlayerStats, history, careerRivalries
    },
    setters: {
      setTab, setOpenMatch, setGodAlerts
    },
    actions: {
      startTournament, reset, simNext, sim10, simAll, simPlayoff, completeToss
    }
  } = useTournament();

  // Scroll-to-top when tab changes
  useEffect(() => {
    if (phase === 'setup') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [tab, phase]);

  // Auto-switch tab when phase transitions
  useEffect(() => {
    if (phase === 'playoffs' || phase === 'done') {
      setTab('playoffs');
    }
  }, [phase, setTab]); 

  if (!hydrated) return null;

  return (
    <div className="min-h-screen text-zinc-100 app-bg font-sans">
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
                <div className="text-[10px] text-zinc-500">{userTeam} • OPENER</div>
              </div>
            </div>
          )}
          {!userName && <div className="flex-1"></div>}
          <div className="text-right flex flex-col items-end gap-1 ml-4 border-l border-zinc-800 pl-4">
            <div className="text-[10px] tracking-widest text-zinc-500">SAVING AS</div>
            <div className="flex items-center gap-2">
              <img src={user.photoURL} alt="profile" className="w-6 h-6 rounded-full border border-zinc-700" />
              <button onClick={logoutGoogle} className="text-xs text-amber-500 hover:text-amber-400 font-bold transition-colors">
                LOGOUT
              </button>
            </div>
          </div>
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
            {tab === 'history' && <HistoryView userName={userName} history={history} careerRivalries={careerRivalries} />}
          </main>
        </>
      )}

      <MatchDetailModal match={openMatch} onClose={() => setOpenMatch(null)} />
      <TossModal toss={pendingToss} onChoose={completeToss} />
      <GodModeAlert alerts={godAlerts} onDismiss={() => setGodAlerts([])} />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setAuthLoading(false);
      });
      return () => unsubscribe();
    } else {
      setAuthLoading(false);
    }
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center">
        <div className="text-amber-500 text-sm font-bold tracking-widest animate-pulse">
          LOADING...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen text-zinc-100 app-bg font-sans flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-950/80 backdrop-blur border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl">
          <div className="text-[10px] tracking-[0.35em] text-amber-500 mb-2">FANTASY T20 SIMULATOR</div>
          <h1 className="text-5xl font-black tracking-tight mb-8" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.02em' }}>
            WELCOME
          </h1>
          <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
            Please sign in with your Google account to save your career stats, rivalries, and tournament history to the cloud.
          </p>
          <button 
            onClick={loginWithGoogle} 
            className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            LOGIN WITH GOOGLE
          </button>
        </div>
      </div>
    );
  }

  return <MainApp user={user} />;
}
