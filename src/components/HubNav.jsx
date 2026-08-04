import React from 'react';
import { Home, Swords, UserRound, Shirt } from 'lucide-react';
import { HUB_DEFAULT_TAB, HUB_SCREENS, INTL_HUB_SCREENS, TAB_TO_HUB } from '../theme';

const HUBS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'match', label: 'Match', icon: Swords },
  { id: 'career', label: 'Career', icon: UserRound },
  { id: 'squad', label: 'Squad', icon: Shirt },
];

export function hubFromTab(tab, internationalActive) {
  if (internationalActive && tab === 'international') return 'match';
  return TAB_TO_HUB[tab] || 'home';
}

export default function HubNav({ tab, setTab, internationalActive = false, variant = 'top' }) {
  const screens = internationalActive ? INTL_HUB_SCREENS : HUB_SCREENS;
  const activeHub = hubFromTab(tab, internationalActive);
  const subScreens = (screens[activeHub] || []).filter((s) => {
    if (internationalActive && (s.id === 'transfers' || s.id === 'boardroom' || s.id === 'teams')) return false;
    return true;
  });

  const goHub = (hubId) => {
    const defaults = internationalActive
      ? { home: 'home', match: 'international', career: 'me', squad: 'training' }
      : HUB_DEFAULT_TAB;
    setTab(defaults[hubId] || 'home');
  };

  if (variant === 'bottom') {
    return (
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--stroke)] surface-1 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4 gap-0">
          {HUBS.map((hub) => {
            const Icon = hub.icon;
            const active = activeHub === hub.id;
            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => goHub(hub.id)}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold tracking-wide transition-colors
                  ${active ? 'accent-text' : 'text-zinc-500'}`}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 1.8} />
                {hub.label}
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <div className="border-t border-[var(--stroke)]">
      {/* Desktop / tablet hub row */}
      <div className="hidden md:flex items-center gap-1 px-1 py-1.5">
        {HUBS.map((hub) => {
          const Icon = hub.icon;
          const active = activeHub === hub.id;
          return (
            <button
              key={hub.id}
              type="button"
              onClick={() => goHub(hub.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-colors
                ${active ? 'accent-text accent-soft accent-ring' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {hub.label}
            </button>
          );
        })}
      </div>

      {/* Sub-screens for active hub */}
      {subScreens.length > 1 && (
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-1 pb-2 md:pt-0 pt-2">
          {subScreens.map((screen) => {
            const active = tab === screen.id;
            return (
              <button
                key={screen.id}
                type="button"
                onClick={() => setTab(screen.id)}
                className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide border transition-colors
                  ${active
                    ? 'accent-text accent-soft border-[var(--accent)]'
                    : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/5'
                  }`}
              >
                {screen.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
