import React from 'react';

export default function PhasePill({ phase }) {
  const map = {
    setup: { label: 'SETUP' },
    league: { label: 'LEAGUE' },
    playoffs: { label: 'PLAYOFFS' },
    done: { label: 'DONE' },
  };
  const { label } = map[phase] || map.setup;
  const isAccent = phase === 'league' || phase === 'playoffs';
  return (
    <span
      className={`text-[9px] tracking-[0.15em] px-1.5 py-0.5 rounded font-bold
        ${isAccent ? 'accent-bg' : 'bg-zinc-700 text-zinc-200'}`}
    >
      {label}
    </span>
  );
}
