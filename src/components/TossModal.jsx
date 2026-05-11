import React from 'react';
import { Coins } from 'lucide-react';
import TeamBadge from './TeamBadge';
import { USER_TEAM } from '../constants';

export default function TossModal({ toss, onChoose }) {
  if (!toss) return null;
  const opponent = toss.home === USER_TEAM ? toss.away : toss.home;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-panel rounded-2xl max-w-sm w-full p-8 text-center animate-slide-up relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />

        <Coins className="w-10 h-10 text-amber-400 mx-auto mb-3 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] relative z-10" />
        <div className="text-[10px] tracking-[0.3em] text-amber-400 mb-1 font-bold relative z-10">TOSS — {toss.label.toUpperCase()}</div>
        <h2 className="text-3xl font-black mb-3 relative z-10" style={{ fontFamily: 'Bebas Neue' }}>YOU WON THE TOSS</h2>

        <div className="flex items-center justify-center gap-3 mb-6 relative z-10">
          <TeamBadge teamId={USER_TEAM} size="sm" />
          <span className="text-zinc-500 text-xs font-mono">vs</span>
          <TeamBadge teamId={opponent} size="sm" />
        </div>

        <p className="text-zinc-400 text-sm mb-6 relative z-10">What's your call, captain?</p>

        <div className="grid grid-cols-2 gap-3 relative z-10">
          <button
            onClick={() => onChoose('bat')}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-4 rounded-lg tracking-wider text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-amber-500/20"
          >
            BAT FIRST
          </button>
          <button
            onClick={() => onChoose('bowl')}
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold py-4 rounded-lg tracking-wider text-sm transition-all hover:-translate-y-0.5"
          >
            BOWL FIRST
          </button>
        </div>
      </div>
    </div>
  );
}
