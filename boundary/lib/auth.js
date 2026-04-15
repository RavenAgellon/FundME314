const API = 'http://localhost:3000';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  return JSON.parse(localStorage.getItem('user') || 'null');
}

export function logout() {
  fetch(`${API}/api/auth/logout`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + getToken() }
  }).catch(() => {});
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

export function requireAuth(expectedRole) {
  const token = getToken();
  const user = getUser();
  if (!token || !user) { window.location.href = '/'; return null; }
  if (expectedRole && user.role !== expectedRole) { window.location.href = '/'; return null; }
  return user;
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  return res;
}