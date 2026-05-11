import React, { useState } from 'react';
import { ChevronRight, Filter, Zap } from 'lucide-react';
import TeamBadge from './TeamBadge';
import { TEAMS } from '../data';
import { USER_TEAM } from '../constants';

export default function ResultsList({ results, onOpen }) {
  const [onlyMine, setOnlyMine] = useState(false);

  if (results.length === 0) {
    return <div className="text-zinc-500 text-sm py-8 text-center animate-fade-in glass-panel rounded-xl">No matches simulated yet. Hit SIM NEXT to begin.</div>;
  }

  const filtered = onlyMine
    ? results.filter(m => m.home === USER_TEAM || m.away === USER_TEAM)
    : results;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] tracking-[0.25em] text-zinc-500 font-bold">
          {filtered.length} {onlyMine ? `${USER_TEAM} MATCHES` : 'MATCHES'}
        </div>
        <button
          onClick={() => setOnlyMine(v => !v)}
          className={`text-[10px] tracking-wider font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all border ${
            onlyMine
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Filter className="w-3 h-3" /> {onlyMine ? `SHOWING ${USER_TEAM}` : `FILTER ${USER_TEAM} ONLY`}
        </button>
      </div>
      <div className="grid gap-2">
        {filtered.map((m, idx) => {
          const realIdx = results.indexOf(m);
          const winningTeam = TEAMS.find(t => t.id === m.winner);
          const isMine = m.home === USER_TEAM || m.away === USER_TEAM;
          const cskWon = m.winner === USER_TEAM;
          return (
            <button
              key={realIdx}
              onClick={() => onOpen(m)}
              className={`w-full py-3 px-4 flex items-center gap-4 border rounded-lg transition-all hover:scale-[1.01] hover:shadow-lg text-left group ${
                isMine
                  ? `bg-amber-500/5 border-amber-500/30 hover:bg-amber-500/10 ${cskWon ? 'shadow-[inset_2px_0_0_0_rgb(52,211,153)]' : 'shadow-[inset_2px_0_0_0_rgb(248,113,113)]'}`
                  : 'bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-800/60'
              }`}
            >
              <div className={`font-mono text-[10px] w-8 transition-colors ${isMine ? 'text-amber-400' : 'text-zinc-500 group-hover:text-amber-400'}`}>#{realIdx + 1}</div>
              <div className="flex items-center gap-3 flex-1">
                <TeamBadge teamId={m.home} size="sm" />
                <span className="text-zinc-500 text-xs font-mono">vs</span>
                <TeamBadge teamId={m.away} size="sm" />
                {m.godMode && (
                  <span className="ml-1 inline-flex items-center gap-1 text-[9px] tracking-wider bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40 font-bold">
                    <Zap className="w-2.5 h-2.5" /> GOD
                  </span>
                )}
              </div>
              <div className="text-xs text-zinc-400 font-mono hidden sm:block bg-black/40 px-2 py-1 rounded border border-white/5">
                {m.inn1.totalRuns}/{m.inn1.wickets} — {m.inn2.totalRuns}/{m.inn2.wickets}
              </div>
              <div className="text-xs font-semibold px-2 py-1 rounded bg-black/20 border border-white/5" style={{ color: winningTeam.primary }}>
                {winningTeam.short} won
              </div>
              <div className="text-[10px] text-zinc-500 font-mono hidden md:block">
                {m.marginType === 'Super Over' ? (
                  <span className="text-amber-400 font-bold tracking-wider px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10">SUPER OVER</span>
                ) : (
                  <>by {m.margin} {m.marginType}</>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
