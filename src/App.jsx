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

// Premium interactive features
import MatchPreview from './components/MatchPreview';
import LiveMatchViewer from './components/LiveMatchViewer';

import InternationalView from './components/InternationalView';

// Expansion Pack RPG Views
import AllTeamsView from './components/AllTeamsView';
import TransfersView from './components/TransfersView';
import TrainingView from './components/TrainingView';
import BoardroomView from './components/BoardroomView';

function MainApp({ user }) {
  const {
    state: {
      userName, userTeam, tourney, schedule, results, phase, tab, playoff, playoffStep, champion,
      openMatch, pendingToss, godModeMatches, godAlerts, hydrated,
      teamStats, allPlayerStats, history, careerRivalries,
      activePreview, liveMatch, hallOfFame, unlockedAchievements, fanPopularity,
      playerXP, userPlayerAttributes, activeSponsor, clt20Active, teamHistoricTitles,
      internationalActive, internationalSchedule, internationalResults, internationalPlayerStats
    },
    setters: {
      setTab, setOpenMatch, setGodAlerts, setActivePreview,
      setPlayerXP, setUserPlayerAttributes, setActiveSponsor, setClt20Active, setTeamHistoricTitles, setFanPopularity
    },
    actions: {
      startTournament, reset, simNext, simMyMatch, sim10, simAll, simPlayoff, completeToss,
      executeLeagueMatch, executePlayoffMatch, completeLiveMatch, executeTrade, startChampionsLeague,
      startInternationalSeason, completeInternationalSeason
    }
  } = useTournament();

  // Scroll-to-top when tab changes
  useEffect(() => {
    if (phase === 'setup') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [tab, phase]);

  // Auto-switch tab when phase transitions
  useEffect(() => {
    if (phase === 'playoffs') {
      setTab('playoffs');
    } else if (phase === 'done') {
      setTab(internationalActive ? 'international' : 'playoffs');
    }
  }, [phase, internationalActive, setTab]); 

  if (!hydrated) return null;

  // Intercept normal dashboard rendering if user is actively watching a match live
  if (liveMatch) {
    return (
      <LiveMatchViewer
        match={liveMatch.match}
        userTeam={userTeam}
        onComplete={completeLiveMatch}
      />
    );
  }

  const themeColorText = internationalActive
    ? 'text-blue-400 font-extrabold drop-shadow-[0_0_12px_rgba(59,130,246,0.4)]'
    : clt20Active 
      ? 'text-cyan-400 font-extrabold drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]' 
      : 'text-amber-500';
  const themeColorTextLighter = internationalActive
    ? 'text-blue-300'
    : clt20Active 
      ? 'text-cyan-300' 
      : 'text-amber-400';
  const themeColorBorder = internationalActive
    ? 'border-blue-500/30'
    : clt20Active 
      ? 'border-cyan-500/30' 
      : 'border-amber-500/30';
  const themeColorBg = internationalActive
    ? 'from-blue-500/20 to-indigo-500/10'
    : clt20Active 
      ? 'from-cyan-500/20 to-indigo-500/10' 
      : 'from-amber-500/20 to-fuchsia-500/10';

  const appStyle = internationalActive
    ? { background: 'radial-gradient(ellipse at top, #021a30 0%, #050505 60%), #050505' }
    : clt20Active
      ? { background: 'radial-gradient(ellipse at top, #022c30 0%, #050505 60%), #050505' }
      : {};

  return (
    <div className="min-h-screen text-zinc-100 app-bg font-sans" style={appStyle}>
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <div className={`text-[10px] tracking-[0.35em] mb-1 ${themeColorText}`}>FANTASY T20 SIMULATOR</div>
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.02em' }}>
              {tourney}
            </h1>
          </div>
          {userName && (
            <div className="text-right flex items-center gap-4">
              {godModeMatches.length > 0 && (
                <div className={`hidden sm:block bg-gradient-to-br ${themeColorBg} border ${themeColorBorder} rounded-lg px-3 py-1.5 text-center`}>
                  <div className={`text-[9px] tracking-[0.25em] font-bold ${themeColorText}`}>⚡ GOD MODE</div>
                  <div className="text-xs font-mono text-zinc-200 font-bold">
                    {godModeMatches.filter(i => i >= results.length).length} / {godModeMatches.length} left
                  </div>
                </div>
              )}
              <div>
                <div className="text-[10px] tracking-[0.25em] text-zinc-500">PLAYING AS</div>
                <div className={`text-lg font-bold ${themeColorTextLighter}`}>{userName}</div>
                <div className="text-sm font-bold text-zinc-500">
                  {internationalActive ? 'India (IND)' : userTeam} • OPENER
                </div>
              </div>
            </div>
          )}
          {!userName && <div className="flex-1"></div>}
          <div className="text-right flex flex-col items-end gap-1 ml-4 border-l border-zinc-800 pl-4">
            <div className="text-[10px] tracking-widest text-zinc-500">SAVING AS</div>
            <div className="flex items-center gap-2">
              <img src={user.photoURL} alt="profile" className="w-6 h-6 rounded-full border border-zinc-700" />
              <button onClick={logoutGoogle} className={`text-xs font-bold transition-colors ${themeColorText} hover:${themeColorTextLighter}`}>
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
            played={internationalActive ? internationalResults.length : results.length}
            total={internationalActive ? internationalSchedule.length : schedule.length}
            schedule={internationalActive ? internationalSchedule : schedule}
            userTeam={internationalActive ? 'IND' : userTeam}
            onSim={simNext}
            onSimMyMatch={simMyMatch}
            onSim10={sim10}
            onSimAll={simAll}
            onPlayoffs={simPlayoff}
            onReset={reset}
            playoffStep={playoffStep}
            clt20Active={clt20Active}
            internationalActive={internationalActive}
          />
          <TabNav tab={tab} setTab={setTab} clt20Active={clt20Active} internationalActive={internationalActive} />

          <main className="max-w-7xl mx-auto px-4 py-6">
            {phase === 'done' && tab === 'playoffs' && (
              <SeasonSummary
                champion={champion}
                allPlayerStats={allPlayerStats}
                userName={userName}
                tourney={tourney}
                onReset={reset}
                playoff={playoff}
                userTeam={userTeam}
                startChampionsLeague={startChampionsLeague}
                clt20Active={clt20Active}
                startInternationalSeason={startInternationalSeason}
              />
            )}
            {tab === 'table' && <PointsTable teamStats={teamStats} />}
            {tab === 'results' && <ResultsList results={results} onOpen={setOpenMatch} />}
            {tab === 'stats' && <StatsLeaderboards playerStats={allPlayerStats} />}
            {tab === 'international' && (
              <InternationalView
                state={{ userName, userTeam, internationalSchedule, internationalResults, internationalPlayerStats }}
                actions={{ simNext, sim10, simAll, completeInternationalSeason, onOpenMatch: setOpenMatch }}
              />
            )}
            {tab === 'me' && (
              <MyProfile
                userName={userName}
                userTeam={userTeam}
                iplResults={[...results, playoff.q1, playoff.elim, playoff.q2, playoff.final].filter(Boolean)}
                iplPlayerStats={allPlayerStats}
                internationalResults={internationalResults}
                internationalPlayerStats={internationalPlayerStats}
                fanPopularity={fanPopularity}
                internationalActive={internationalActive}
                onOpenMatch={setOpenMatch}
              />
            )}
            {tab === 'teams' && <AllTeamsView state={{ teamHistoricTitles, teamStats, userTeam, results, history, champion }} />}
            {tab === 'transfers' && <TransfersView state={{ userTeam, fanPopularity }} actions={{ executeTrade }} />}
            {tab === 'training' && <TrainingView state={{ playerXP, userPlayerAttributes, userName }} setters={{ setPlayerXP, setUserPlayerAttributes }} />}
            {tab === 'boardroom' && <BoardroomView state={{ activeSponsor, fanPopularity, allPlayerStats, results, userName }} setters={{ setActiveSponsor }} />}
            {tab === 'playoffs' && <PlayoffsView playoff={playoff} onOpen={setOpenMatch} champion={champion} />}
            {tab === 'history' && (
              <HistoryView
                userName={userName}
                userTeam={userTeam}
                history={history}
                careerRivalries={careerRivalries}
                hallOfFame={hallOfFame}
                unlockedAchievements={unlockedAchievements}
                currentIPLResults={results}
                currentIntResults={internationalResults}
                currentIPLPlayerStats={allPlayerStats}
              />
            )}
          </main>
        </>
      )}

      {/* Popups, interactive overlays & modals */}
      <MatchDetailModal match={openMatch} onClose={() => setOpenMatch(null)} />
      
      <TossModal toss={pendingToss} onChoose={completeToss} />
      
      {activePreview && (
        <MatchPreview
          homeId={activePreview.home}
          awayId={activePreview.away}
          userName={userName}
          teamStats={teamStats}
          playerStats={allPlayerStats}
          results={results}
          careerRivalries={careerRivalries}
          onSimulate={(tactics) => {
            if (activePreview.type === 'league') executeLeagueMatch(activePreview, tactics, false);
            else executePlayoffMatch(activePreview, tactics, false);
          }}
          onWatch={(tactics) => {
            if (activePreview.type === 'league') executeLeagueMatch(activePreview, tactics, true);
            else executePlayoffMatch(activePreview, tactics, true);
          }}
          onClose={() => setActivePreview(null)}
        />
      )}

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
