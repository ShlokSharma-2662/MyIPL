import React from 'react';
import { Trophy, User, BarChart3, Calendar, Crown } from 'lucide-react';

export default function TabNav({ tab, setTab }) {
  const tabs = [
    { id: 'table', label: 'Points Table', icon: BarChart3 },
    { id: 'results', label: 'Results', icon: Calendar },
    { id: 'stats', label: 'Orange / Purple', icon: Crown },
    { id: 'me', label: 'My Profile', icon: User },
    { id: 'playoffs', label: 'Playoffs', icon: Trophy },
  ];
  return (
    <div className="border-b border-zinc-800/50 bg-black/40 backdrop-blur-md sticky top-[60px] z-20">
      <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar relative">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-4 text-xs tracking-wider font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-2 relative group
                ${active ? 'text-amber-400 border-amber-500' : 'text-zinc-500 hover:text-zinc-200 border-transparent'}`}
            >
              <Icon className={`w-3.5 h-3.5 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
              {t.label.toUpperCase()}
              {active && <div className="absolute inset-0 bg-amber-500/5 -z-10" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
