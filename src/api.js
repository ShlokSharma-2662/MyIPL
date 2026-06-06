// Client for the MyIPL .NET backend.
// Base URL comes from VITE_API_URL (see .env), falling back to local dev.
import { getIdToken } from './firebase';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5288';

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = await getIdToken();
    if (!token) throw new Error('Not signed in — cannot call a protected endpoint.');
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`API ${method} ${path} failed: ${res.status} ${text}`);
    err.status = res.status;
    throw err;
  }

  // 204/empty bodies → null
  const raw = await res.text();
  return raw ? JSON.parse(raw) : null;
}

// --- Leaderboard ---------------------------------------------------------

/** Submit a finished season (requires sign-in). */
export function submitSeason(season) {
  return request('/api/leaderboard/season', { method: 'POST', body: season, auth: true });
}

/** Global standings, top N by titles then win-rate (public). */
export function getLeaderboard(limit = 50) {
  return request(`/api/leaderboard/top?limit=${limit}`);
}

// --- Profiles ------------------------------------------------------------

/** The signed-in user's career history (requires sign-in). */
export function getMyProfile() {
  return request('/api/profile/me', { auth: true });
}

/** Any user's public career history by Firebase UID. */
export function getProfile(uid) {
  return request(`/api/profile/${encodeURIComponent(uid)}`);
}

// --- Game save (replaces Firestore persistence) --------------------------

/**
 * Load the signed-in user's saved game, or null if there's no save yet or the
 * backend is unreachable (caller then falls back to the localStorage cache).
 */
export async function getGameState() {
  try {
    return await request('/api/game', { auth: true });
  } catch (e) {
    if (e.status === 404) return null;          // no save yet
    console.warn('getGameState failed; using local fallback:', e);
    return null;                                // offline / server down
  }
}

/** Persist the full game state. Fire-and-forget; never throws. */
export async function saveGameState(state) {
  try {
    await request('/api/game', { method: 'PUT', body: state, auth: true });
  } catch (e) {
    console.warn('saveGameState failed:', e);
  }
}

/** Delete the saved game (used on reset). Never throws. */
export async function clearGameState() {
  try {
    await request('/api/game', { method: 'DELETE', auth: true });
  } catch (e) {
    console.warn('clearGameState failed:', e);
  }
}

export { BASE_URL };
