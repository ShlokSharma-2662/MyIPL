import React from 'react';
import { Trophy } from 'lucide-react';
import TeamBadge from './TeamBadge';
import { TEAMS } from '../data';

export default function PlayoffsView({ playoff, onOpen, champion }) {
  const { q1, elim, q2, final } = playoff;

  const Bracket = ({ label, match }) => {
    if (!match) {
      return (
        <div className="glass-panel border border-dashed border-zinc-700/50 rounded-xl p-5 text-center flex flex-col justify-center min-h-[120px]">
          <div className="text-[10px] tracking-[0.25em] text-zinc-600 font-bold">{label}</div>
          <div className="text-zinc-700 text-xs mt-3 font-mono">Pending</div>
        </div>
      );
    }
    const wt = TEAMS.find(t => t.id === match.winner);
    return (
      <button onClick={() => onOpen(match)}
        className="block w-full glass-panel border border-zinc-800/50 hover:border-amber-500/50 rounded-xl p-5 text-left transition-all hover:-translate-y-1 hover:shadow-lg group relative overflow-hidden min-h-[120px]">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="text-[10px] tracking-[0.25em] text-amber-400 font-bold">{label}</div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <TeamBadge teamId={match.home} size="sm" />
            <span className="text-zinc-200 text-sm font-semibold">{match.home}</span>
          </div>
          <span className="text-zinc-600 text-xs font-mono bg-zinc-900/50 px-2 py-0.5 rounded">VS</span>
          <div className="flex items-center gap-3">
            <span className="text-zinc-200 text-sm font-semibold">{match.away}</span>
            <TeamBadge teamId={match.away} size="sm" />
          </div>
        </div>
        <div className="text-xs mt-4 pt-3 border-t border-zinc-800/50 flex items-center gap-2">
          <span className="font-bold px-2 py-0.5 rounded bg-black/40 border border-white/5" style={{ color: wt.primary }}>{wt.short} won</span>
          <span className="text-zinc-500 font-mono">
            {match.marginType === 'Super Over' ? 'in Super Over' : `by ${match.margin} ${match.marginType}`}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {champion && (
        <div className="mb-10 bg-black/40 border border-amber-500/30 rounded-2xl p-8 text-center relative overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.15)] animate-slide-up">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-500/20 blur-[80px] rounded-full pointer-events-none" />
          <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] relative z-10" />
          <div className="text-xs tracking-[0.4em] text-amber-400 mb-2 font-bold relative z-10">CHAMPIONS</div>
          <div className="text-6xl font-black relative z-10 drop-shadow-lg" style={{ fontFamily: 'Bebas Neue', color: TEAMS.find(t => t.id === champion).primary }}>
            {TEAMS.find(t => t.id === champion).name}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <Bracket label="QUALIFIER 1" match={q1} />
        <Bracket label="ELIMINATOR" match={elim} />
        <Bracket label="QUALIFIER 2" match={q2} />
        <Bracket label="FINAL" match={final} />
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-800/50 text-xs text-zinc-500 space-y-2 font-medium">
        <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-zinc-600" /> Q1: 1st vs 2nd → winner to Final</div>
        <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-zinc-600" /> Eliminator: 3rd vs 4th → loser out</div>
        <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-zinc-600" /> Q2: loser of Q1 vs winner of Eliminator → winner to Final</div>
      </div>
    </div>
  );
}
