// Tiny helper around fetch so pages stay clean.
// It also sends the login token with every request.

const TOKEN_KEY = 'token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`; // "here is my ID card"

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Token expired or invalid -> forget it and tell the app to show the login page
  if (res.status === 401 && token) {
    setToken(null);
    window.dispatchEvent(new Event('logout'));
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `${method} ${path} failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}
