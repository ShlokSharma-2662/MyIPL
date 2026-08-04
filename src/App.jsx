import React, { useEffect, useState } from 'react';
import { useTournament } from './hooks/useTournament';
import { auth, loginWithGoogle } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { applyAccentVars, resolveAccent } from './theme';

import SetupScreen from './components/SetupScreen';
import AppShell from './components/AppShell';
import HomeView from './components/HomeView';
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
import RecordsView from './components/RecordsView';
import LeaderboardView from './components/LeaderboardView';
import MatchPreview from './components/MatchPreview';
import LiveMatchViewer from './components/LiveMatchViewer';
import InternationalView from './components/InternationalView';
import AllTeamsView from './components/AllTeamsView';
import TrainingView from './components/TrainingView';
import TransfersView from './components/TransfersView';
import BoardroomView from './components/BoardroomView';

function MainApp({ user }) {
  const {
    state: {
      userName, userTeam, tourney, schedule, results, phase, tab, playoff, playoffStep, champion,
      openMatch, pendingToss, godModeMatches, godAlerts, hydrated,
      teamStats, allPlayerStats, history, careerRivalries,
      activePreview, liveMatch, hallOfFame, unlockedAchievements, fanPopularity,
      playerXP, userPlayerAttributes, activeSponsor,
      clt20Active, teamHistoricTitles,
      internationalActive, internationalSchedule, internationalResults, internationalPlayerStats
    },
    setters: {
      setTab, setOpenMatch, setGodAlerts, setActivePreview,
      setPlayerXP, setUserPlayerAttributes, setActiveSponsor
    },
    actions: {
      startTournament, reset, simNext, simMyMatch, sim10, simAll, simPlayoff, completeToss,
      executeLeagueMatch, executePlayoffMatch, completeLiveMatch, executeTrade, startChampionsLeague,
      startInternationalSeason, completeInternationalSeason
    }
  } = useTournament();

  useEffect(() => {
    if (phase === 'setup') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [tab, phase]);

  useEffect(() => {
    if (phase === 'playoffs') {
      setTab('playoffs');
    } else if (phase === 'done') {
      setTab(internationalActive ? 'international' : 'playoffs');
    }
  }, [phase, internationalActive, setTab]);

  // Franchise / mode accent tokens on <html>
  useEffect(() => {
    const accent = resolveAccent({ userTeam, internationalActive, clt20Active });
    applyAccentVars(accent);
  }, [userTeam, internationalActive, clt20Active]);

  if (!hydrated) return null;

  const effectiveUserTeam = internationalActive ? 'IND' : userTeam;
  const played = internationalActive ? internationalResults.length : results.length;
  const total = internationalActive ? internationalSchedule.length : schedule.length;
  const godModeLeft = godModeMatches.filter((i) => i >= results.length).length;

  if (liveMatch) {
    return (
      <LiveMatchViewer
        match={liveMatch.match}
        userTeam={effectiveUserTeam}
        onComplete={completeLiveMatch}
      />
    );
  }

  return (
    <div className="min-h-screen text-zinc-100 app-bg font-sans">
      {phase === 'setup' ? (
        <SetupScreen onStart={startTournament} />
      ) : (
        <AppShell
          user={user}
          userName={userName}
          userTeam={userTeam}
          tourney={tourney}
          phase={phase}
          played={played}
          total={total}
          schedule={internationalActive ? internationalSchedule : schedule}
          playoffStep={playoffStep}
          godModeLeft={godModeLeft}
          godModeTotal={godModeMatches.length}
          internationalActive={internationalActive}
          tab={tab}
          setTab={setTab}
          onSim={simNext}
          onSimMyMatch={simMyMatch}
          onSim10={sim10}
          onSimAll={simAll}
          onPlayoffs={simPlayoff}
          onReset={reset}
        >
          {phase === 'done' && (tab === 'playoffs' || tab === 'home') && !internationalActive && (
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
              teamRecord={teamStats[userTeam]}
              season={history.length}
            />
          )}

          {tab === 'home' && !internationalActive && (
            <HomeView
              userName={userName}
              userTeam={userTeam}
              phase={phase}
              schedule={schedule}
              results={results}
              teamStats={teamStats}
              playoff={playoff}
              playoffStep={playoffStep}
              champion={champion}
              godModeMatches={godModeMatches}
              onPlayMyMatch={simMyMatch}
              onSimNext={simNext}
              onOpenPlayoffs={simPlayoff}
              setTab={setTab}
            />
          )}
          {tab === 'home' && internationalActive && (
            <InternationalView
              state={{ userName, userTeam, internationalSchedule, internationalResults, internationalPlayerStats }}
              actions={{ simNext, sim10, simAll, completeInternationalSeason, onOpenMatch: setOpenMatch }}
            />
          )}

          {tab === 'table' && <PointsTable teamStats={teamStats} userTeam={userTeam} />}
          {tab === 'leaderboard' && <LeaderboardView />}
          {tab === 'results' && <ResultsList results={results} onOpen={setOpenMatch} userTeam={userTeam} />}
          {tab === 'stats' && <StatsLeaderboards playerStats={allPlayerStats} />}
          {tab === 'training' && (
            <TrainingView
              state={{ playerXP, userPlayerAttributes, userName }}
              setters={{ setPlayerXP, setUserPlayerAttributes }}
            />
          )}
          {tab === 'transfers' && !internationalActive && (
            <TransfersView state={{ userTeam, fanPopularity }} actions={{ executeTrade }} />
          )}
          {tab === 'boardroom' && !internationalActive && (
            <BoardroomView
              state={{ activeSponsor, fanPopularity, allPlayerStats, results, userName }}
              setters={{ setActiveSponsor }}
            />
          )}
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
          {tab === 'teams' && (
            <AllTeamsView state={{ teamHistoricTitles, teamStats, userTeam, results, history, champion }} />
          )}
          {tab === 'records' && (
            <RecordsView
              history={history}
              userName={userName}
              userCareerLive={allPlayerStats[`USER:${userName}`]}
            />
          )}
          {tab === 'playoffs' && (
            <PlayoffsView playoff={playoff} onOpen={setOpenMatch} champion={champion} />
          )}
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
        </AppShell>
      )}

      <MatchDetailModal match={openMatch} onClose={() => setOpenMatch(null)} />
      <TossModal toss={pendingToss} onChoose={completeToss} userTeam={effectiveUserTeam} />

      {activePreview && (
        <MatchPreview
          homeId={activePreview.home}
          awayId={activePreview.away}
          userName={userName}
          userTeam={effectiveUserTeam}
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

      <GodModeAlert alerts={godAlerts} onDismiss={() => setGodAlerts([])} userTeam={userTeam} />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    applyAccentVars(resolveAccent({ userTeam: 'CSK' }));
  }, []);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setAuthLoading(false);
      });
      return () => unsubscribe();
    }
    setAuthLoading(false);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center">
        <div className="accent-text text-sm font-bold tracking-widest animate-pulse">LOADING...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen text-zinc-100 app-bg font-sans flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full surface-1 border border-[var(--stroke)] rounded-2xl p-8 text-center">
          <div className="text-[10px] tracking-[0.35em] accent-text mb-2 font-bold">MYIPL</div>
          <h1 className="text-5xl font-black tracking-tight mb-8" style={{ fontFamily: 'Bebas Neue' }}>
            WELCOME
          </h1>
          <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
            Sign in with Google to save your career, rivalries, and tournament history to the cloud.
          </p>
          <button
            type="button"
            onClick={loginWithGoogle}
            className="btn-accent w-full py-4 text-sm tracking-wide"
          >
            LOGIN WITH GOOGLE
          </button>
        </div>
      </div>
    );
  }

  return <MainApp user={user} />;
}
