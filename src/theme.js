import { TEAMS } from './data';

/** Relative luminance 0–1 for hex colors (#rgb / #rrggbb). */
export function hexLuminance(hex) {
  if (!hex || typeof hex !== 'string') return 0;
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrastOn(hex) {
  return hexLuminance(hex) > 0.55 ? '#0B1210' : '#FAFAFA';
}

/**
 * Resolve broadcast accent from mode + franchise.
 * IND blue / CLT20 cyan override franchise during those modes.
 */
export function resolveAccent({ userTeam, internationalActive = false, clt20Active = false } = {}) {
  if (internationalActive) {
    return {
      primary: '#3B82F6',
      onPrimary: '#020617',
      soft: 'rgba(59, 130, 246, 0.14)',
      wash: 'rgba(59, 130, 246, 0.08)',
      label: 'IND',
    };
  }
  if (clt20Active) {
    return {
      primary: '#22D3EE',
      onPrimary: '#083344',
      soft: 'rgba(34, 211, 238, 0.14)',
      wash: 'rgba(34, 211, 238, 0.08)',
      label: 'CLT20',
    };
  }
  const team = TEAMS.find((t) => t.id === userTeam);
  const primary = team?.primary || '#F9CD05';
  return {
    primary,
    onPrimary: contrastOn(primary),
    soft: hexToRgba(primary, 0.14),
    wash: hexToRgba(primary, 0.08),
    label: team?.short || userTeam || 'IPL',
    team,
  };
}

export function hexToRgba(hex, alpha = 1) {
  let h = (hex || '#F9CD05').replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Apply CSS custom properties on a DOM element (usually document.documentElement). */
export function applyAccentVars(accent, el = typeof document !== 'undefined' ? document.documentElement : null) {
  if (!el || !accent) return;
  el.style.setProperty('--accent', accent.primary);
  el.style.setProperty('--accent-on', accent.onPrimary);
  el.style.setProperty('--accent-soft', accent.soft);
  el.style.setProperty('--accent-wash', accent.wash);
}

/** Tab id → hub id */
export const TAB_TO_HUB = {
  home: 'home',
  table: 'match',
  results: 'match',
  stats: 'match',
  playoffs: 'match',
  international: 'match',
  me: 'career',
  history: 'career',
  records: 'career',
  leaderboard: 'career',
  training: 'squad',
  transfers: 'squad',
  boardroom: 'squad',
  teams: 'squad',
};

export const HUB_DEFAULT_TAB = {
  home: 'home',
  match: 'results',
  career: 'me',
  squad: 'training',
};

export const HUB_SCREENS = {
  home: [{ id: 'home', label: 'Overview' }],
  match: [
    { id: 'results', label: 'Results' },
    { id: 'table', label: 'Table' },
    { id: 'stats', label: 'Leaders' },
    { id: 'playoffs', label: 'Playoffs' },
  ],
  career: [
    { id: 'me', label: 'Profile' },
    { id: 'history', label: 'History' },
    { id: 'records', label: 'Records' },
    { id: 'leaderboard', label: 'Ranks' },
  ],
  squad: [
    { id: 'training', label: 'Training' },
    { id: 'transfers', label: 'Transfers' },
    { id: 'boardroom', label: 'Boardroom' },
    { id: 'teams', label: 'All Teams' },
  ],
};

export const INTL_HUB_SCREENS = {
  home: [{ id: 'home', label: 'Overview' }],
  match: [{ id: 'international', label: 'Tour' }],
  career: [
    { id: 'me', label: 'Profile' },
    { id: 'history', label: 'History' },
  ],
  squad: [{ id: 'training', label: 'Training' }],
};
