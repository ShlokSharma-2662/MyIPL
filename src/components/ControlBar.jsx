import React from 'react';
import { Play, FastForward, Zap, RotateCcw, Swords, Target } from 'lucide-react';
import PhasePill from './PhasePill';

export default function ControlBar({ phase, played, total, schedule, userTeam, onSim, onSimMyMatch, onSim10, onSimAll, onPlayoffs, onReset, playoffStep, clt20Active = false }) {
  const progressPct = total > 0 ? Math.round((played / total) * 100) : 0;

  const hasNextMyMatch = phase === 'league' && schedule && userTeam &&
    schedule.slice(played).some(m => m.home === userTeam || m.away === userTeam);

  const primaryBtnClass = clt20Active
    ? "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 shadow-cyan-500/20 hover:shadow-cyan-500/40"
    : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20 hover:shadow-amber-500/40";

  const progressClass = clt20Active
    ? "bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
    : "bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]";

  return (
    <div className="bg-black/60 border-y border-zinc-800/50 backdrop-blur-md sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap animate-fade-in">
        <div className="flex items-center gap-3">
          <PhasePill phase={phase} />
          {phase === 'league' && (
            <span className="text-xs text-zinc-400 font-mono bg-zinc-900/50 px-2 py-1 rounded border border-zinc-800">{played} / {total}</span>
          )}
          {phase === 'playoffs' && (
            <span className="text-xs text-zinc-400 font-mono bg-zinc-900/50 px-2 py-1 rounded border border-zinc-800">{['Q1','Eliminator','Q2','Final'][playoffStep]} up next</span>
          )}
        </div>

        <div className="h-6 w-px bg-zinc-800 mx-1 hidden sm:block" />

        {phase === 'league' && (
          <>
            <button onClick={onSim}
              className={`${primaryBtnClass} text-xs font-bold px-4 py-2 rounded-md tracking-wider flex items-center gap-1.5 shadow-lg transition-all hover:-translate-y-0.5`}>
              <Play className="w-3 h-3" /> SIM NEXT
            </button>
            {hasNextMyMatch && (
              <button onClick={onSimMyMatch}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black text-xs font-bold px-4 py-2 rounded-md tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5">
                <Target className="w-3 h-3" /> MY MATCH
              </button>
            )}
            <button onClick={onSim10}
              className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-100 text-xs font-bold px-4 py-2 rounded-md tracking-wider flex items-center gap-1.5 border border-zinc-700/50 transition-all hover:-translate-y-0.5">
              <FastForward className="w-3 h-3" /> SIM 10
            </button>
            <button onClick={onSimAll}
              className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-100 text-xs font-bold px-4 py-2 rounded-md tracking-wider flex items-center gap-1.5 border border-zinc-700/50 transition-all hover:-translate-y-0.5">
              <Zap className="w-3 h-3" /> SIM ALL
            </button>
          </>
        )}

        {phase === 'playoffs' && (
          <button onClick={onPlayoffs}
            className="bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 hover:from-fuchsia-500 hover:to-fuchsia-600 text-white text-xs font-bold px-4 py-2 rounded-md tracking-wider flex items-center gap-1.5 shadow-lg shadow-fuchsia-600/20 hover:shadow-fuchsia-600/40 transition-all hover:-translate-y-0.5">
            <Swords className="w-3 h-3" /> SIM {['QUALIFIER 1','ELIMINATOR','QUALIFIER 2','FINAL'][playoffStep]}
          </button>
        )}

        <div className="ml-auto">
          <button onClick={onReset}
            className="text-zinc-500 hover:text-zinc-300 text-xs flex items-center gap-1.5 px-3 py-1.5 transition-colors">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {phase === 'league' && (
        <div className="h-0.5 bg-zinc-900 relative overflow-hidden">
          <div
            className={`h-full ${progressClass} transition-all duration-500`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </div>
  );
}
