import React, { useState } from 'react';
import { USER_BAT_SR, USER_BOWL_SR, USER_BOWL_ECON } from '../constants';
import { TEAMS } from '../data';
import { applyAccentVars, resolveAccent, contrastOn } from '../theme';

export default function SetupScreen({ onStart }) {
  const [name, setName] = useState('Shlok');
  const [tourney, setTourney] = useState('Indian Premier League');
  const [team, setTeam] = useState('CSK');

  const selectTeam = (id) => {
    setTeam(id);
    applyAccentVars(resolveAccent({ userTeam: id }));
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-10 animate-fade-in relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 20%, var(--accent-wash), transparent 70%)' }}
      />
      <div className="max-w-lg w-full surface-1 border border-[var(--stroke)] rounded-2xl p-8 sm:p-10 relative z-10 animate-slide-up">
        <div className="h-1 absolute top-0 inset-x-0 rounded-t-2xl" style={{ background: 'var(--accent)' }} />
        <div className="mb-2 text-[10px] tracking-[0.3em] accent-text font-bold">TOURNAMENT SETUP</div>
        <h1 className="text-5xl font-black mb-2 text-zinc-50" style={{ fontFamily: 'Bebas Neue' }}>
          BUILD YOUR LEGEND.
        </h1>
        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
          Pick any franchise and open the innings — SR {USER_BAT_SR}, bowl SR {USER_BOWL_SR}, economy {USER_BOWL_ECON}.
        </p>

        <label className="block mb-5">
          <span className="text-xs tracking-wider text-zinc-400 block mb-2">PLAYER NAME</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full surface-2 border border-[var(--stroke)] rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-[var(--accent)] font-mono"
          />
        </label>

        <div className="mb-5">
          <span className="text-xs tracking-wider text-zinc-400 block mb-3">YOUR FRANCHISE</span>
          <div className="grid grid-cols-5 gap-2">
            {TEAMS.map((t) => {
              const selected = team === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  title={t.name}
                  onClick={() => selectTeam(t.id)}
                  className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-0.5 transition-transform hover:scale-[1.03]
                    ${selected ? 'scale-[1.03]' : 'border-transparent opacity-80 hover:opacity-100'}`}
                  style={{
                    backgroundColor: t.primary,
                    color: contrastOn(t.primary),
                    borderColor: selected ? '#fafafa' : 'transparent',
                    boxShadow: selected ? `0 0 0 2px ${t.primary}` : undefined,
                  }}
                >
                  <span className="text-[10px] sm:text-xs font-black leading-none">{t.short}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">
            {TEAMS.find((t) => t.id === team)?.name}
          </p>
        </div>

        <label className="block mb-8">
          <span className="text-xs tracking-wider text-zinc-400 block mb-2">TOURNAMENT NAME</span>
          <input
            value={tourney}
            onChange={(e) => setTourney(e.target.value)}
            className="w-full surface-2 border border-[var(--stroke)] rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-[var(--accent)] font-mono"
          />
        </label>

        <button
          type="button"
          onClick={() => onStart(name.trim() || 'You', tourney.trim() || 'Fantasy IPL', team)}
          className="btn-accent w-full py-4 tracking-widest text-sm"
        >
          START SEASON →
        </button>

        <div className="mt-8 pt-6 border-t border-[var(--stroke)] text-xs text-zinc-500 space-y-2 font-medium">
          <div>10 teams · 70 league matches · 14 per side</div>
          <div>Top 4 → Qualifier 1, Eliminator, Qualifier 2, Final</div>
          <div>Call the toss when your team wins · progress auto-saves</div>
        </div>
      </div>
    </div>
  );
}
