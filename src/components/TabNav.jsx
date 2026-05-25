import React from 'react';
import { Trophy, User, BarChart3, Calendar, Crown, BookOpen, Shield, Globe } from 'lucide-react';

export default function TabNav({ tab, setTab, clt20Active = false, internationalActive = false }) {
  const tabs = internationalActive
    ? [
        { id: 'international', label: 'International', mobileLabel: 'Intl', icon: Globe },
        { id: 'me', label: 'My Profile', mobileLabel: 'Profile', icon: User },
        { id: 'history', label: 'History', mobileLabel: 'History', icon: BookOpen },
      ]
    : [
        { id: 'table', label: 'Points Table', mobileLabel: 'Table', icon: BarChart3 },
        { id: 'results', label: 'Results', mobileLabel: 'Results', icon: Calendar },
        { id: 'stats', label: 'Orange / Purple', mobileLabel: 'Leaders', icon: Crown },
        { id: 'me', label: 'My Profile', mobileLabel: 'Profile', icon: User },
        { id: 'teams', label: 'All Teams', mobileLabel: 'Teams', icon: Shield },
        { id: 'history', label: 'History', mobileLabel: 'History', icon: BookOpen },
        { id: 'playoffs', label: 'Playoffs', mobileLabel: 'Playoffs', icon: Trophy },
      ];

  const activeColorClass = internationalActive
    ? 'text-blue-400 border-blue-500'
    : clt20Active 
      ? 'text-cyan-400 border-cyan-500' 
      : 'text-amber-400 border-amber-500';

  const activeBgClass = internationalActive
    ? 'bg-blue-500/5'
    : clt20Active 
      ? 'bg-cyan-500/5' 
      : 'bg-amber-500/5';

  return (
    <div className="border-b border-zinc-800/50 bg-black/40 backdrop-blur-md sticky top-[60px] z-20">
      <div className="max-w-7xl mx-auto px-4 relative">
        <div
          className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/70 to-transparent pointer-events-none z-10 sm:hidden"
          aria-hidden="true"
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/70 to-transparent pointer-events-none z-10 sm:hidden"
          aria-hidden="true"
        />
        <div className="flex gap-1 overflow-x-auto no-scrollbar snap-x snap-mandatory">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`snap-start px-4 py-4 text-xs tracking-wider font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-2 relative group
                ${active ? activeColorClass : 'text-zinc-500 hover:text-zinc-200 border-transparent'}`}
            >
              <Icon className={`w-3.5 h-3.5 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="sm:hidden">{(t.mobileLabel || t.label).toUpperCase()}</span>
              <span className="hidden sm:inline">{t.label.toUpperCase()}</span>
              {active && <div className={`absolute inset-0 ${activeBgClass} -z-10`} />}
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}
