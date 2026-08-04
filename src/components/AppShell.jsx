import React from 'react';
import { Play, FastForward, Zap, RotateCcw, Swords, Target } from 'lucide-react';
import PhasePill from './PhasePill';
import TeamBadge from './TeamBadge';
import HubNav from './HubNav';
import { logoutGoogle } from '../firebase';

export default function AppShell({
  user,
  userName,
  userTeam,
  tourney,
  phase,
  played,
  total,
  schedule,
  playoffStep,
  godModeLeft,
  godModeTotal,
  internationalActive,
  tab,
  setTab,
  onSim,
  onSimMyMatch,
  onSim10,
  onSimAll,
  onPlayoffs,
  onReset,
  children,
}) {
  const progressPct = total > 0 ? Math.round((played / total) * 100) : 0;
  const hasNextMyMatch = phase === 'league' && schedule && userTeam &&
    schedule.slice(played).some((m) => m.home === userTeam || m.away === userTeam);

  const handleSimAll = () => {
    if (window.confirm(`Simulate all remaining league matches?\n\nAdvances from ${played}/${total} to playoffs.`)) {
      onSimAll();
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset tournament progress?\n\nClears the current season and cannot be undone.')) {
      onReset();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 surface-1 border-b border-[var(--stroke)]">
        {/* Brand + identity + primary CTA */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 pb-2">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-bold accent-text uppercase tracking-[0.2em]">MyIPL</span>
                <PhasePill phase={phase} />
                {phase === 'league' && (
                  <span className="text-[10px] font-mono text-zinc-500">{played}/{total}</span>
                )}
                {phase === 'playoffs' && (
                  <span className="text-[10px] font-mono text-zinc-500">
                    {['Q1', 'Elim', 'Q2', 'Final'][playoffStep]}
                  </span>
                )}
              </div>
              <h1
                className="text-xl sm:text-2xl font-black tracking-tight truncate leading-none"
                style={{ fontFamily: 'Bebas Neue' }}
              >
                {tourney}
              </h1>
            </div>

            {godModeTotal > 0 && (
              <div className="hidden sm:flex flex-col items-center px-2.5 py-1 rounded-lg accent-soft border border-[color:color-mix(in_srgb,var(--accent)_35%,transparent)]">
                <span className="text-[8px] font-bold accent-text tracking-wider">GOD</span>
                <span className="text-xs font-mono font-bold text-zinc-100">{godModeLeft}/{godModeTotal}</span>
              </div>
            )}

            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <TeamBadge teamId={internationalActive ? 'IND' : userTeam} size="sm" />
              <div className="text-right leading-tight">
                <div className="text-sm font-bold accent-text truncate max-w-[8rem]">{userName}</div>
                <div className="text-[10px] text-zinc-500 font-semibold">
                  {internationalActive ? 'IND' : userTeam} · OPENER
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 border-l border-[var(--stroke)] pl-3">
              {user?.photoURL && (
                <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full border border-[var(--stroke)]" />
              )}
              <button
                type="button"
                onClick={logoutGoogle}
                className="text-[10px] font-bold accent-text hover:opacity-80"
              >
                OUT
              </button>
            </div>
          </div>

          {/* Compact sim controls */}
          {(phase === 'league' || phase === 'playoffs') && (
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              {phase === 'league' && (
                <>
                  <button type="button" onClick={onSim} className="btn-accent text-[10px] px-3 py-1.5 flex items-center gap-1 tracking-wide">
                    <Play className="w-3 h-3" /> NEXT
                  </button>
                  {hasNextMyMatch && (
                    <button
                      type="button"
                      onClick={onSimMyMatch}
                      className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white flex items-center gap-1 tracking-wide hover:bg-emerald-500"
                    >
                      <Target className="w-3 h-3" /> MINE
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onSim10}
                    className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg surface-2 text-zinc-200 border border-[var(--stroke)] flex items-center gap-1 tracking-wide hover:bg-white/5"
                  >
                    <FastForward className="w-3 h-3" /> 10
                  </button>
                  <button
                    type="button"
                    onClick={handleSimAll}
                    className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg surface-2 text-zinc-200 border border-[var(--stroke)] flex items-center gap-1 tracking-wide hover:bg-white/5"
                  >
                    <Zap className="w-3 h-3" /> ALL
                  </button>
                </>
              )}
              {phase === 'playoffs' && (
                <button
                  type="button"
                  onClick={onPlayoffs}
                  className="btn-accent text-[10px] px-3 py-1.5 flex items-center gap-1 tracking-wide"
                >
                  <Swords className="w-3 h-3" />
                  {['Q1', 'ELIM', 'Q2', 'FINAL'][playoffStep]}
                </button>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="ml-auto text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 px-2 py-1.5"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          )}

          {phase === 'league' && (
            <div className="mt-2.5 h-0.5 rounded-full bg-black/40 overflow-hidden">
              <div
                className="h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPct}%`, background: 'var(--accent)' }}
              />
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <HubNav tab={tab} setTab={setTab} internationalActive={internationalActive} variant="top" />
        </div>
      </header>

      <HubNav tab={tab} setTab={setTab} internationalActive={internationalActive} variant="bottom" />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-5 pb-24 md:pb-8">
        {children}
      </main>
    </>
  );
}
