import { useState } from 'react';
import { api } from '../api.js';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // POST /api/auth/login or /api/auth/register -> { token, user }
      const data = await api(`/auth/${mode}`, { method: 'POST', body: { email, password } });
      onLogin(data);
    } catch (err) {
      setError(err.message); // e.g. "Wrong email or password"
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (e) => {
    e.preventDefault();
    setMode(isLogin ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={submit}>
        <h2>{isLogin ? '👋 Welcome back' : '✨ Create your account'}</h2>
        <p className="hint">3D Map + AI Calendar</p>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                 required minLength={6} />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
        </button>

        <p className="hint">
          {isLogin ? 'No account yet? ' : 'Already have an account? '}
          <a href="#" className="link" onClick={switchMode}>
            {isLogin ? 'Create one' : 'Log in'}
          </a>
        </p>
      </form>
    </div>
  );
}
