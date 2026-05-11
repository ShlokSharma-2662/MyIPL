import React from 'react';

export default function StatCard({ label, value, sub, accent = 'amber' }) {
  const colorMap = {
    amber: 'text-amber-400',
    fuchsia: 'text-fuchsia-400',
  };
  const bgMap = {
    amber: 'from-amber-500/10 to-transparent border-amber-500/20',
    fuchsia: 'from-fuchsia-500/10 to-transparent border-fuchsia-500/20',
  };
  const blurMap = {
    amber: 'bg-amber-500/10 group-hover:bg-amber-500/20',
    fuchsia: 'bg-fuchsia-500/10 group-hover:bg-fuchsia-500/20',
  };
  return (
    <div className={`bg-gradient-to-br ${bgMap[accent]} border glass-panel p-5 rounded-xl transition-all hover:-translate-y-1 hover:shadow-lg relative overflow-hidden group`}>
      <div className={`absolute top-0 right-0 w-24 h-24 ${blurMap[accent]} rounded-full blur-2xl -mr-10 -mt-10 transition-colors pointer-events-none`} />
      <div className="text-[10px] tracking-[0.25em] text-zinc-400 mb-2 font-bold relative z-10">{label}</div>
      <div className={`text-4xl font-black ${colorMap[accent]} relative z-10 drop-shadow-md`} style={{ fontFamily: 'Bebas Neue' }}>
        {value}
      </div>
      {sub && <div className="text-xs text-zinc-500 font-mono mt-1 relative z-10">{sub}</div>}
    </div>
  );
}
