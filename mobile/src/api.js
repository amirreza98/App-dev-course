// Same idea as client/src/api.js – but for the phone:
// - full address (the app does not run on the same server as the API)
// - the token lives in SecureStore (encrypted phone storage) instead of localStorage
import * as SecureStore from 'expo-secure-store';
import { API_URL } from './config';

const TOKEN_KEY = 'token';

export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);

export const setToken = (token) =>
  token ? SecureStore.setItemAsync(TOKEN_KEY, token) : SecureStore.deleteItemAsync(TOKEN_KEY);

// App.js tells us what to do when the token is no longer valid
let onLogout = () => {};
export const setOnLogout = (fn) => { onLogout = fn; };

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';

  const token = await getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('No connection to the server. Check your internet and API_URL in src/config.js');
  }

  // Token expired -> forget it and go back to the login screen
  if (res.status === 401 && token) {
    await setToken(null);
    onLogout();
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `${method} ${path} failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}
