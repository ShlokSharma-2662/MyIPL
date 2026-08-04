import React from 'react';
import { Zap } from 'lucide-react';
import TeamBadge from './TeamBadge';

export default function GodModeAlert({ alerts, onDismiss, userTeam }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onDismiss}>
      <div
        className="glass-panel rounded-2xl max-w-md w-full p-8 text-center animate-slide-up relative overflow-hidden border-2 border-amber-500 shadow-[0_0_60px_rgba(245,158,11,0.4)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-fuchsia-500/10 pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300" />
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-amber-500/30 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-fuchsia-500/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="relative inline-block mb-3">
            <Zap className="w-20 h-20 text-amber-400 mx-auto drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]" strokeWidth={2.5} />
            <Zap className="w-20 h-20 text-amber-400 mx-auto absolute inset-0 animate-ping opacity-30" strokeWidth={2.5} />
          </div>

          <div className="text-[10px] tracking-[0.5em] text-amber-400 mb-1 font-bold">⚡ GOD MODE ⚡</div>
          <h2 className="text-5xl font-black mb-3 bg-gradient-to-br from-amber-300 to-amber-500 text-transparent bg-clip-text" style={{ fontFamily: 'Bebas Neue' }}>
            UNSTOPPABLE
          </h2>

          {alerts.length === 1 ? (
            <>
              <p className="text-zinc-300 text-sm mb-3">Your stats were divine in</p>
              <div className="flex items-center justify-center gap-3 mb-5 bg-black/40 border border-amber-500/30 rounded-lg py-3 px-4">
                <span className="text-amber-400 font-bold font-mono">Match #{alerts[0].matchNum}</span>
                <span className="text-zinc-500">•</span>
                <div className="flex items-center gap-2">
                  <TeamBadge teamId={userTeam} size="sm" />
                  <span className="text-zinc-400 text-xs">vs</span>
                  <TeamBadge teamId={alerts[0].opp} size="sm" />
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-zinc-300 text-sm mb-4">God mode activated in <span className="text-amber-400 font-bold">{alerts.length} matches</span></p>
              <div className="max-h-40 overflow-y-auto mb-5 space-y-1.5 bg-black/40 border border-amber-500/20 rounded-lg p-3">
                {alerts.map(a => (
                  <div key={a.matchNum} className="flex items-center justify-between text-xs">
                    <span className="text-amber-300 font-mono font-bold">Match #{a.matchNum}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">vs</span>
                      <TeamBadge teamId={a.opp} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="text-[10px] text-zinc-500 mb-5 font-mono tracking-wider">
            SR 350 · AVG 200 · BOWL SR 6 · ECON 2.5
          </div>

          <button
            onClick={onDismiss}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-3 rounded-lg tracking-[0.3em] text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-amber-500/40"
          >
            LET'S GO →
          </button>
        </div>
      </div>
    </div>
  );
}
