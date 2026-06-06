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
    throw new Error(`API ${method} ${path} failed: ${res.status} ${text}`);
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

export { BASE_URL };
