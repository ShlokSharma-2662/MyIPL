import React, { useEffect, useRef, useState } from 'react';
import {
  Trophy, User, BarChart3, Calendar, Crown, BookOpen, Shield, Globe,
  Award, Users, Dumbbell, ArrowLeftRight, Briefcase, MoreHorizontal, Check,
} from 'lucide-react';

const IPL_PRIMARY = [
  { id: 'table', label: 'Table', icon: BarChart3 },
  { id: 'results', label: 'Results', icon: Calendar },
  { id: 'stats', label: 'Leaders', icon: Crown },
  { id: 'me', label: 'Profile', icon: User },
  { id: 'playoffs', label: 'Playoffs', icon: Trophy },
];

const IPL_MORE_GROUPS = [
  {
    title: 'Career',
    items: [
      { id: 'history', label: 'History', icon: BookOpen },
      { id: 'records', label: 'IPL Records', icon: Award },
      { id: 'leaderboard', label: 'Leaderboard', icon: Users },
      { id: 'teams', label: 'All Teams', icon: Shield },
    ],
  },
  {
    title: 'Build',
    items: [
      { id: 'training', label: 'Training', icon: Dumbbell },
      { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
      { id: 'boardroom', label: 'Boardroom', icon: Briefcase },
    ],
  },
];

const INTL_TABS = [
  { id: 'international', label: 'Tour', icon: Globe },
  { id: 'training', label: 'Training', icon: Dumbbell },
  { id: 'me', label: 'Profile', icon: User },
  { id: 'history', label: 'History', icon: BookOpen },
];

export default function TabNav({ tab, setTab, clt20Active = false, internationalActive = false }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  const moreIds = IPL_MORE_GROUPS.flatMap(g => g.items.map(i => i.id));
  const moreActive = !internationalActive && moreIds.includes(tab);
  const activeMoreItem = moreActive
    ? IPL_MORE_GROUPS.flatMap(g => g.items).find(i => i.id === tab)
    : null;
  const ActiveMoreIcon = activeMoreItem?.icon;

  useEffect(() => {
    setMoreOpen(false);
  }, [tab, internationalActive]);

  useEffect(() => {
    if (!moreOpen) return;
    const onPointer = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreOpen]);

  const accent = internationalActive
    ? { text: 'text-blue-400', soft: 'bg-blue-500/10', ring: 'ring-blue-500/30' }
    : clt20Active
      ? { text: 'text-cyan-400', soft: 'bg-cyan-500/10', ring: 'ring-cyan-500/30' }
      : { text: 'text-amber-400', soft: 'bg-amber-500/10', ring: 'ring-amber-500/30' };

  const primaryTabs = internationalActive ? INTL_TABS : IPL_PRIMARY;

  const TabButton = ({ item, active }) => {
    const Icon = item.icon;
    return (
      <button
        type="button"
        onClick={() => setTab(item.id)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold tracking-wide transition-colors
          ${active
            ? `${accent.text} ${accent.soft} ring-1 ${accent.ring}`
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
          }`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <div className="border-b border-zinc-800/50 bg-black/50 backdrop-blur-md sticky top-[60px] z-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center gap-1 py-2">
          <nav className="flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto no-scrollbar">
            {primaryTabs.map((item) => (
              <TabButton key={item.id} item={item} active={tab === item.id} />
            ))}
          </nav>

          {!internationalActive && (
            <div className="relative shrink-0 pl-1 ml-1 border-l border-zinc-800" ref={moreRef}>
              <button
                type="button"
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                onClick={() => setMoreOpen(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold tracking-wide transition-colors
                  ${moreActive || moreOpen
                    ? `${accent.text} ${accent.soft} ring-1 ${accent.ring}`
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                  }`}
              >
                {activeMoreItem ? (
                  <>
                    {ActiveMoreIcon && <ActiveMoreIcon className="w-3.5 h-3.5" />}
                    <span className="max-w-[5.5rem] truncate">{activeMoreItem.label}</span>
                  </>
                ) : (
                  <>
                    <MoreHorizontal className="w-3.5 h-3.5" />
                    <span>More</span>
                  </>
                )}
              </button>

              {moreOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl shadow-2xl p-1.5 z-50 animate-fade-in"
                >
                  {IPL_MORE_GROUPS.map((group) => (
                    <div key={group.title} className="mb-1 last:mb-0">
                      <div className="px-2.5 pt-2 pb-1 text-[9px] tracking-[0.2em] uppercase text-zinc-600 font-bold">
                        {group.title}
                      </div>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = tab === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setTab(item.id);
                              setMoreOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs transition-colors
                              ${active
                                ? `${accent.text} ${accent.soft}`
                                : 'text-zinc-300 hover:bg-white/5 hover:text-zinc-100'
                              }`}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                            <span className="flex-1 font-medium">{item.label}</span>
                            {active && <Check className={`w-3.5 h-3.5 ${accent.text}`} />}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
