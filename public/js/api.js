/**
 * api.js — shared fetch wrapper
 *
 * All API calls go through these helpers so that:
 *   1. The base URL is in one place
 *   2. The JWT token is attached automatically when the user is logged in
 *   3. Error responses are handled consistently
 *
 * VIEW layer uses this to talk to the CONTROLLER layer (via the API).
 */

const BASE_URL = '/api';

/** Read the JWT token saved at login. */
function getToken() {
  return localStorage.getItem('token');
}

/** Save token + user info after login/register. */
function saveSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

/** Remove token + user info on logout. */
function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/** Get the logged-in user object (or null). */
function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

/**
 * The main request helper.
 *
 * @param {string} path   - e.g. '/products' or '/auth/login'
 * @param {'GET'|'POST'|'PUT'|'DELETE'} method
 * @param {object|null} body  - will be JSON-encoded
 * @returns {Promise<any>}    - parsed JSON response
 * @throws  {Error}           - message from the server's { message: '...' }
 */
async function request(path, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(BASE_URL + path, options);

  // 204 No Content has no body
  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data;
}

// ── Convenience helpers ────────────────────────────────────────────────────

const api = {
  get:    (path)        => request(path, 'GET'),
  post:   (path, body)  => request(path, 'POST',   body),
  put:    (path, body)  => request(path, 'PUT',     body),
  delete: (path)        => request(path, 'DELETE'),
};
