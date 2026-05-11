import React from 'react';

export default function PhasePill({ phase }) {
  const map = {
    setup: { label: 'SETUP', color: 'bg-zinc-700' },
    league: { label: 'LEAGUE STAGE', color: 'bg-amber-600' },
    playoffs: { label: 'PLAYOFFS', color: 'bg-fuchsia-600' },
    done: { label: 'COMPLETE', color: 'bg-emerald-600' },
  };
  const { label, color } = map[phase];
  return (
    <span className={`${color} text-[10px] tracking-[0.2em] px-2 py-1 rounded font-bold text-white`}>
      {label}
    </span>
  );
}
