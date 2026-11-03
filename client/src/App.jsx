import { lazy, Suspense, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';
import LoginPage from './pages/LoginPage.jsx';
import MapPage from './pages/MapPage.jsx';
import CalendarPage from './pages/CalendarPage.jsx';

// The 3D campus is big (three.js) – load it only when someone opens the page
const CampusPage = lazy(() => import('./pages/CampusPage.jsx'));

const PAGES = {
  map: { label: '🗺️ 3D Map', component: MapPage },
  calendar: { label: '📅 AI Calendar', component: CalendarPage },
  campus: { label: '🏫 Campus 3D', component: CampusPage },
};

export default function App() {
  const [page, setPage] = useState('map');
  const [user, setUser] = useState(null);                            // null = not logged in
  const [checking, setChecking] = useState(() => Boolean(getToken())); // token saved? check it first

  // Page reloaded with a saved token -> ask the server who we are
  useEffect(() => {
    if (!getToken()) return;
    api('/auth/me')
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setChecking(false));
  }, []);

  // api.js fires a "logout" event when the token is no longer valid
  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('logout', onLogout);
    return () => window.removeEventListener('logout', onLogout);
  }, []);

  const login = ({ token, user }) => {
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setPage('map');
  };

  if (checking) return <p className="hint" style={{ padding: 20 }}>Loading…</p>;
  if (!user) return <LoginPage onLogin={login} />;

  const Page = PAGES[page].component;

  return (
    <div className="app">
      <nav className="nav">
        <strong>App Dev Course</strong>
        {Object.entries(PAGES).map(([key, { label }]) => (
          <a key={key} href="#" className={page === key ? 'active' : ''}
             onClick={(e) => { e.preventDefault(); setPage(key); }}>
            {label}
          </a>
        ))}
        <span className="nav-user">{user.email}</span>
        <button className="small" onClick={logout}>Log out</button>
      </nav>
      <main className="main">
        <Suspense fallback={<p className="hint" style={{ padding: 20 }}>Loading…</p>}>
          <Page />
        </Suspense>
      </main>
    </div>
  );
}
