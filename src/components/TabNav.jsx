import React from 'react';
import { Trophy, User, BarChart3, Calendar, Crown, BookOpen, Shield, ArrowLeftRight, Target, Briefcase, Globe } from 'lucide-react';

export default function TabNav({ tab, setTab, clt20Active = false, internationalActive = false }) {
  const tabs = internationalActive
    ? [
        { id: 'international', label: 'International', icon: Globe },
        { id: 'training', label: 'Nets RPG', icon: Target },
        { id: 'me', label: 'My Profile', icon: User },
        { id: 'history', label: 'History', icon: BookOpen },
      ]
    : [
        { id: 'table', label: 'Points Table', icon: BarChart3 },
        { id: 'results', label: 'Results', icon: Calendar },
        { id: 'stats', label: 'Orange / Purple', icon: Crown },
        { id: 'me', label: 'My Profile', icon: User },
        { id: 'teams', label: 'All Teams', icon: Shield },
        { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
        { id: 'training', label: 'Nets RPG', icon: Target },
        { id: 'boardroom', label: 'Boardroom', icon: Briefcase },
        { id: 'history', label: 'History', icon: BookOpen },
        { id: 'playoffs', label: 'Playoffs', icon: Trophy },
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
      <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar relative">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-4 text-xs tracking-wider font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-2 relative group
                ${active ? activeColorClass : 'text-zinc-500 hover:text-zinc-200 border-transparent'}`}
            >
              <Icon className={`w-3.5 h-3.5 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
              {t.label.toUpperCase()}
              {active && <div className={`absolute inset-0 ${activeBgClass} -z-10`} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
