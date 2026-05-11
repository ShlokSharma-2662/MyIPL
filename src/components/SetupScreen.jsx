import React, { useState } from 'react';
import { USER_BAT_SR, USER_BOWL_SR, USER_BOWL_ECON } from '../constants';

export default function SetupScreen({ onStart }) {
  const [name, setName] = useState('Shlok');
  const [tourney, setTourney] = useState('Shlok Premier League');

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 animate-fade-in relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[100px] mix-blend-screen -ml-[200px]" />
      </div>
      <div className="max-w-lg w-full glass-panel rounded-2xl p-10 relative z-10 animate-slide-up">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
        <div className="mb-3 text-[10px] tracking-[0.3em] text-amber-500 font-bold">TOURNAMENT SETUP</div>
        <h1 className="text-5xl font-black mb-2 bg-gradient-to-br from-white to-zinc-500 text-transparent bg-clip-text" style={{ fontFamily: 'Bebas Neue' }}>
          BUILD YOUR LEGEND.
        </h1>
        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
          You'll open the innings for CSK with elite stats — strike rate {USER_BAT_SR}, bowl SR {USER_BOWL_SR}, economy {USER_BOWL_ECON}. Other players have form swings each match.
        </p>

        <label className="block mb-5 group">
          <span className="text-xs tracking-wider text-zinc-400 block mb-2 group-focus-within:text-amber-400 transition-colors">PLAYER NAME</span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 font-mono transition-all shadow-inner"
          />
        </label>

        <label className="block mb-8 group">
          <span className="text-xs tracking-wider text-zinc-400 block mb-2 group-focus-within:text-amber-400 transition-colors">TOURNAMENT NAME</span>
          <input
            value={tourney}
            onChange={e => setTourney(e.target.value)}
            className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 font-mono transition-all shadow-inner"
          />
        </label>

        <button
          onClick={() => onStart(name.trim() || 'You', tourney.trim() || 'Fantasy IPL')}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 transition-all duration-300 text-black font-bold py-4 rounded-lg tracking-widest text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:-translate-y-0.5"
        >
          START SEASON →
        </button>

        <div className="mt-8 pt-6 border-t border-zinc-800/50 text-xs text-zinc-500 space-y-2 font-medium">
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-zinc-600" /> 10 teams • 70 league matches • 14 per side</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-zinc-600" /> Top 4 → Qualifier 1, Eliminator, Qualifier 2, Final</div>
          <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-zinc-600" /> Call the toss when CSK wins it • progress auto-saves</div>
        </div>
      </div>
    </div>
  );
}
