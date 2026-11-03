# App Development Course – Build two real apps

We build two apps **step by step, with our own hands**: a 🗺️ **3D Map** and a 📅 **AI Calendar** (for people who leave everything to the last minute).
**Tools:** React + Vite · Node.js + Express · MapLibre

> 📋 **Start here: [Project plan on Miro](https://miro.com/app/board/uXjVHeLSHBw=/?share_link_id=439689196857)**. Before we write any code, we walk through the full software development life cycle of this project: Planning → Requirements → Design → Development → Testing → Deployment & Maintenance.

| Step (open its tutorial) | Branch | Time |
|---|---|---|
| [0 · Your first React app](https://github.com/amirreza98/App-dev-course/tree/main#readme) | `main` | ~45 min |
| [1 · React basics](https://github.com/amirreza98/App-dev-course/tree/step-1-react#readme) | `step-1-react` | ~60 min |
| [2 · Backend](https://github.com/amirreza98/App-dev-course/tree/step-2-backend#readme) | `step-2-backend` | ~60 min |
| [3 · Calendar](https://github.com/amirreza98/App-dev-course/tree/step-3-calendar#readme) | `step-3-calendar` | ~50 min |
| [4 · Planner + AI](https://github.com/amirreza98/App-dev-course/tree/step-4-planner#readme) | `step-4-planner` | ~50 min |
| [5 · Database](https://github.com/amirreza98/App-dev-course/tree/step-5-database#readme) | `step-5-database` | ~60 min |
| [6 · Login](https://github.com/amirreza98/App-dev-course/tree/step-6-auth#readme) **📍 you are here** | `step-6-auth` | ~70 min |
| [7 · Go live](https://github.com/amirreza98/App-dev-course/tree/step-7-deploy#readme) | `step-7-deploy` | ~60 min |

**How it works:** this page is the tutorial for this step. Follow it from top to bottom: create, replace or delete exactly the files it tells you → **save** → look at the browser. **Lesson 0 starts from an empty folder**, and every lesson continues in your own code – reading the lessons in order is all you need. The branch holds the **finished code** of the step, so you can compare or catch up.

<details>
<summary><b>🆘 Fell behind? Get the finished code of any step</b></summary>

You need **Node.js** (LTS, 20.19 or newer): https://nodejs.org

```bash
git clone https://github.com/amirreza98/App-dev-course.git
cd App-dev-course
git checkout -f <branch>     # e.g. step-2-backend
npm install
npm run dev
```

Open **http://localhost:5173**. Stop the app with **Control + C**. From step 5 on, you also need your own `server/.env` (see Lessons 5 and 6).
</details>

---

# Lesson 6 – User accounts: everyone gets their own data

| | |
|---|---|
| ⏱️ Time | ~70 min |
| 🏁 Start from | your code from Lesson 5 (or `git checkout -f step-5-database`) |
| ✅ Finished result | branch `step-6-auth` |
| 🎯 You will | add **register / log in / log out**, so every student sees only **their own** tasks and places |

> 🆘 **Stuck or behind?** Run `git checkout -f step-6-auth && npm install`, then make sure your `server/.env` has `DATABASE_URL` (Lesson 5) **and** `JWT_SECRET` (P1 below).

---

## 💡 The problem: everyone shares one calendar

Right now there is **one** list of tasks for the whole world. If your classmate opens your app, they see – and can delete – your tasks. Real apps need **user accounts**.

Three new ideas:

| Idea | In real life | In our app |
|---|---|---|
| **Register** | you get a membership card at the gym | `POST /api/auth/register` creates a user |
| **Log in** | you show who you are at the door | `POST /api/auth/login` checks email + password |
| **Token** | the wristband you get after the door – you show it at every machine | a **JWT** the browser sends with every request |

## 💡 Two security rules

**1. Never store passwords.** We store a **hash**: a scrambled fingerprint of the password that cannot be turned back.

```
"secret123"  ──bcrypt──▶  "$2b$10$Xk2fQ9...p1e"   (stored in the database)
```

At login, we hash the typed password again and compare the fingerprints. Even if someone steals the database, they don't get the passwords.

**2. A token proves who you are.** After login, the server gives the browser a **JWT** (JSON Web Token) – a text that says *"this is user 7"*, **signed** with a secret key only the server knows. Nobody can change it without breaking the signature.

```
Browser                                 Server
  │ POST /api/auth/login {email, pw} ──▶ │ checks password
  │ ◀── { token: "eyJhbGciOi..." }       │ signs token with JWT_SECRET
  │                                      │
  │ GET /api/tasks                       │
  │ Authorization: Bearer eyJhbGciOi ──▶ │ verifies token → user 7
  │ ◀── only the tasks of user 7         │
```

---

# Part P – Server: users and tokens

## P1. Install two packages and add a secret

Stop the app (**Control + C**), then:

```bash
npm install bcryptjs jsonwebtoken -w server
```

- **`bcryptjs`** – hashes and checks passwords
- **`jsonwebtoken`** – creates and checks JWT tokens

<details>
<summary>✅ <b>Checkpoint:</b> your <code>server/package.json</code> should now look like this</summary>

```json
{
  "name": "server",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js"
  },
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.5",
    "express": "^5.3.0",
    "jsonwebtoken": "^9.0.3",
    "pg": "^8.23.1"
  }
}
```
</details>

Now create a **secret key** for signing tokens. Run this in the terminal – it prints a long random text:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Open your **`server/.env`** and add a line with that text:

```bash
JWT_SECRET=paste-the-long-random-text-here
```

Your `server/.env` now has `DATABASE_URL`, `JWT_SECRET` (and maybe `OPENAI_API_KEY`). Replace **`server/.env.example`** with the updated documentation:

```bash
PORT=3001

# Your Neon PostgreSQL connection string (neon.tech -> your project -> Connect)
# It looks like: postgresql://user:password@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
DATABASE_URL=

# Secret key that signs login tokens. Any long random text – keep it secret!
# Create one with:  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=

# Optional: set this to let the calendar planner use a real LLM.
# Without it, a simple rule-based planner is used.
OPENAI_API_KEY=
```

> 🔐 Anyone who knows `JWT_SECRET` can create tokens for any user. Never put it in your code or on GitHub.

## P2. ✍️ A `users` table

Replace **`server/src/db.js`** with:

```js
import pg from 'pg';

// Load server/.env (DATABASE_URL and JWT_SECRET live there)
try { process.loadEnvFile(); } catch { /* no .env file */ }

for (const name of ['DATABASE_URL', 'JWT_SECRET']) {
  if (!process.env[name]) {
    console.error(`❌ ${name} is missing. Add it to server/.env (see server/.env.example).`);
    process.exit(1);
  }
}

// Return DATE columns as plain 'YYYY-MM-DD' text (not JavaScript Date objects)
pg.types.setTypeParser(1082, (value) => value);

// A pool keeps a few connections open and reuses them for every query
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Create the tables the first time the server starts
export async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        email         TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS places (
        id   SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        lng  DOUBLE PRECISION NOT NULL,
        lat  DOUBLE PRECISION NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id       SERIAL PRIMARY KEY,
        title    TEXT NOT NULL,
        deadline DATE NOT NULL,
        hours    REAL NOT NULL,
        priority TEXT NOT NULL DEFAULT 'medium',
        done     BOOLEAN NOT NULL DEFAULT false
      );

      -- Every place and task now belongs to one user
      ALTER TABLE places ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
      ALTER TABLE tasks  ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    `);
  } catch (err) {
    console.error('❌ Could not connect to the database. Check DATABASE_URL in server/.env');
    console.error(err.message);
    process.exit(1);
  }
  console.log('✅ Database ready');
}
```

What's new:

- the server now also stops with a clear ❌ message if `JWT_SECRET` is missing
- table **`users`**: `email TEXT NOT NULL UNIQUE` → the database itself refuses a second account with the same email
- `ALTER TABLE ... ADD COLUMN IF NOT EXISTS user_id ... REFERENCES users(id)` – every task and place gets an **owner**. `REFERENCES` is a **foreign key**: `user_id` must be the id of a real user. `ON DELETE CASCADE` → if a user is deleted, their tasks and places go too.
- the Brandenburg Gate is no longer added here – every new user gets it at registration (P4)

> 💡 Tasks and places from Lesson 5 have no owner (`user_id` is empty), so after this lesson nobody sees them. That's fine – they were test data.

## P3. ✍️ The token helpers: `middleware/auth.js`

Create the folder **`server/src/middleware`** and in it the file **`server/src/middleware/auth.js`**:

```js
import jwt from 'jsonwebtoken';

// Create a token that proves "this is user 7". It is valid for 7 days.
export function createToken(user) {
  return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Middleware: runs BEFORE a route. Lets the request through only with a valid token.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';      // "Bearer eyJhbGciOi..."
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please log in' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET); // throws if fake or expired
    req.userId = payload.userId;                                // the routes use this
    next();                                                     // continue to the route
  } catch {
    res.status(401).json({ error: 'Your session expired, please log in again' });
  }
}
```

- **`createToken(user)`** – signs `{ userId: 7 }` with `JWT_SECRET`. `expiresIn: '7d'` → after 7 days you must log in again.
- **`requireAuth`** is a **middleware**: a function that runs **before** the route, like a doorman.
  - no token → `401 Please log in`
  - fake or expired token → `jwt.verify` throws → `401`
  - valid token → it writes the user's id into **`req.userId`** and calls **`next()`** → the request continues to the route

## P4. ✍️ Register, log in, "who am I?": `routes/auth.js`

Create **`server/src/routes/auth.js`**:

```js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { createToken, requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register -> create an account. Body: { email, password }
router.post('/register', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!email.includes('@')) return res.status(400).json({ error: 'Please enter a valid email' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must have at least 6 characters' });

  // Never store the password itself – only a hash of it
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, passwordHash]
    );
    const user = result.rows[0];
    // Welcome gift: one example place on the map
    await pool.query(
      'INSERT INTO places (name, lng, lat, user_id) VALUES ($1, $2, $3, $4)',
      ['Brandenburg Gate', 13.3777, 52.5163, user.id]
    );
    res.status(201).json({ token: createToken(user), user });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'This email is already registered' });
    throw err;
  }
});

// POST /api/auth/login -> check email + password. Body: { email, password }
router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  // Same message for "no such user" and "wrong password" – don't tell attackers which one
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Wrong email or password' });
  }
  res.json({ token: createToken(user), user: { id: user.id, email: user.email } });
});

// GET /api/auth/me -> who am I? (used when the page is reloaded)
router.get('/me', requireAuth, async (req, res) => {
  const result = await pool.query('SELECT id, email FROM users WHERE id = $1', [req.userId]);
  if (!result.rows[0]) return res.status(401).json({ error: 'Please log in' });
  res.json(result.rows[0]);
});

export default router;
```

- **register**: check the input → `bcrypt.hash(password, 10)` → save the user → give a welcome place → answer with a token. The `10` is how slow the hash is on purpose (slow = hard to guess by trying millions of passwords).
- error code **`23505`** is PostgreSQL's *"unique value already exists"* → answer `409 This email is already registered`
- **login**: find the user by email → `bcrypt.compare` the typed password with the stored hash → token
- the same message for *"no such email"* and *"wrong password"* – an attacker shouldn't learn which emails exist
- **`/me`** uses `requireAuth` directly on one route. The frontend calls it after a page reload.

## P5. ✍️ Every query gets an owner

Replace **`server/src/routes/places.js`** with:

```js
import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// Every query uses req.userId (set by requireAuth), so users only see their own places

// GET /api/places -> my saved places
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM places WHERE user_id = $1 ORDER BY id', [req.userId]);
  res.json(result.rows);
});

// POST /api/places -> save a new place. Body: { name, lng, lat }
router.post('/', async (req, res) => {
  const { name, lng, lat } = req.body;
  if (!name || lng == null || lat == null) {
    return res.status(400).json({ error: 'name, lng and lat are required' });
  }
  const result = await pool.query(
    'INSERT INTO places (name, lng, lat, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, Number(lng), Number(lat), req.userId]
  );
  res.status(201).json(result.rows[0]);
});

// DELETE /api/places/:id -> remove one of MY places
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM places WHERE id = $1 AND user_id = $2', [Number(req.params.id), req.userId]);
  res.status(204).end();
});

export default router;
```

Replace **`server/src/routes/tasks.js`** with:

```js
import { Router } from 'express';
import { pool } from '../db.js';
import { planTasks } from '../planner.js';

const router = Router();

const COLORS = ['#4361ee', '#e63946', '#2a9d8f', '#f4a261', '#9b5de5', '#06aed5', '#e76f51', '#588157'];
const PRIORITIES = ['low', 'medium', 'high'];

// The colour is not stored in the database: we calculate it from the id
const withColor = (task) => ({ ...task, color: COLORS[(task.id - 1) % COLORS.length] });

// Every query uses req.userId (set by requireAuth), so users only see their own tasks

// GET /api/tasks -> list my tasks
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY deadline, id', [req.userId]);
  res.json(result.rows.map(withColor));
});

// POST /api/tasks -> create a task. Body: { title, deadline, hours, priority }
router.post('/', async (req, res) => {
  const { title, deadline, hours, priority = 'medium' } = req.body;
  if (!title || !deadline || !hours) {
    return res.status(400).json({ error: 'title, deadline and hours are required' });
  }
  const result = await pool.query(
    `INSERT INTO tasks (title, deadline, hours, priority, user_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [title, deadline, Number(hours), PRIORITIES.includes(priority) ? priority : 'medium', req.userId]
  );
  res.status(201).json(withColor(result.rows[0]));
});

// PATCH /api/tasks/:id -> change some fields, e.g. { done: true } or { priority: 'high' }
router.patch('/:id', async (req, res) => {
  const { title, deadline, hours, priority, done } = req.body;
  // COALESCE(new, old): keep the old value when a field is not sent
  const result = await pool.query(
    `UPDATE tasks SET
       title    = COALESCE($1, title),
       deadline = COALESCE($2, deadline),
       hours    = COALESCE($3, hours),
       priority = COALESCE($4, priority),
       done     = COALESCE($5, done)
     WHERE id = $6 AND user_id = $7
     RETURNING *`,
    [
      title ?? null,
      deadline ?? null,
      hours !== undefined ? Number(hours) : null,
      PRIORITIES.includes(priority) ? priority : null,
      done !== undefined ? Boolean(done) : null,
      Number(req.params.id),
      req.userId,
    ]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
  res.json(withColor(result.rows[0]));
});

// DELETE /api/tasks/:id -> remove a task
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [Number(req.params.id), req.userId]);
  res.status(204).end();
});

// POST /api/tasks/plan -> build a schedule that spreads work out BEFORE the deadline.
// Body: { maxHoursPerDay, useAi, today: 'YYYY-MM-DD' }
router.post('/plan', async (req, res) => {
  const maxHoursPerDay = Number(req.body?.maxHoursPerDay) || 4;
  const useAi = Boolean(req.body?.useAi);
  const today = /^\d{4}-\d{2}-\d{2}$/.test(req.body?.today) ? req.body.today : undefined;
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE done = false AND user_id = $1', [req.userId]);
    const plan = await planTasks(result.rows.map(withColor), { maxHoursPerDay, useAi, today });
    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Planning failed' });
  }
});

export default router;
```

Compare with Lesson 5: every query got **`user_id`**.

| Before | Now |
|---|---|
| `SELECT * FROM tasks` | `SELECT * FROM tasks WHERE user_id = $1` |
| `INSERT INTO tasks (title, …)` | `INSERT INTO tasks (title, …, user_id)` |
| `DELETE FROM tasks WHERE id = $1` | `DELETE FROM tasks WHERE id = $1 AND user_id = $2` |

That `AND user_id = …` is important: without it, Omar could delete Lena's task just by guessing its id.

## P6. ✍️ Lock the doors

Replace **`server/src/index.js`** with:

```js
import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import { requireAuth } from './middleware/auth.js';
import authRouter from './routes/auth.js';
import placesRouter from './routes/places.js';
import tasksRouter from './routes/tasks.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Login and registration – open to everyone
app.use('/api/auth', authRouter);

// Project 1: 3D Map – only for logged-in users
app.use('/api/places', requireAuth, placesRouter);

// Project 2: AI Calendar – only for logged-in users
app.use('/api/tasks', requireAuth, tasksRouter);

// If a database query fails, answer with a clear error instead of crashing
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 3001;
await initDb();
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
```

- `/api/auth` is open to everyone – you can't need a token to *get* a token
- `app.use('/api/places', requireAuth, placesRouter)` – the doorman stands in front of **all** places and tasks routes

**👀 Test it:** start the app (`npm run dev`) and open **http://localhost:3001/api/tasks** in the browser.

```json
{"error":"Please log in"}
```

The server is locked. 🔒 The app in the browser shows errors now – it doesn't have a token yet. Let's build the login page.

---

# Part Q – Frontend: the login page

## Q1. ✍️ Send the token with every request

Replace **`client/src/api.js`** with:

```js
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
```

- **`localStorage`** is a small storage in the browser that **survives a page reload**. We keep the token there.
- every request now sends the header `Authorization: Bearer <token>`
- if the server answers `401` while we had a token (expired), we delete it and fire a **`logout` event** – the app will show the login page
- `data.error` – the server's error message (e.g. *"Wrong email or password"*) is now passed on, so we can show it

## Q2. ✍️ The login page

Create **`client/src/pages/LoginPage.jsx`**:

```jsx
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
```

- **one form for both**: `mode` is `'login'` or `'register'`; the link at the bottom switches it
- `api(`/auth/${mode}`)` calls `/api/auth/login` or `/api/auth/register`
- `type="email"`, `required`, `minLength={6}` – the browser checks the input before sending
- `onLogin` is a **prop**: the page doesn't decide what happens after login – `App` does

Add these styles **at the end** of **`client/src/index.css`**:

```css
/* Login page (step 6) */
.login-page { min-height: 100vh; display: grid; place-items: center; padding: 20px; background: #1d3557; }
.login-card { width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 12px; padding: 24px; }
.login-card h2 { margin: 0; }
.login-card input { width: 100%; }
.error { background: #fde2e4; color: #c1121f; padding: 8px 10px; border-radius: 6px; font-size: 13px; margin: 0; }
.nav-user { margin-left: auto; font-size: 13px; color: #cfd8e3; }
```

<details>
<summary>✅ <b>Checkpoint:</b> your <code>client/src/index.css</code> should now look like this</summary>

```css
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; color: #1d1d1f; background: #f6f6f8; }

.app { display: flex; flex-direction: column; height: 100vh; }
.nav { display: flex; gap: 20px; align-items: center; padding: 12px 20px; background: #1d3557; color: white; }
.nav a { color: #cfd8e3; text-decoration: none; }
.nav a.active { color: white; font-weight: 600; }
.main { flex: 1; overflow: auto; }

button { padding: 8px 12px; border: 0; border-radius: 6px; background: #1d3557; color: white; cursor: pointer; }
button:disabled { opacity: 0.5; cursor: default; }
button.small { padding: 2px 8px; background: #e0e0e5; color: #333; }
input { padding: 8px; border: 1px solid #ccc; border-radius: 6px; }
label { display: flex; flex-direction: column; font-size: 12px; gap: 4px; }
.hint { color: #666; font-size: 13px; }

.list { list-style: none; padding: 0; }
.list li { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #eee; }
.link { cursor: pointer; color: #1d3557; }

/* Map page */
.map-layout { display: flex; height: 100%; }
.panel { width: 280px; padding: 16px; background: white; overflow: auto; }
.buttons { display: flex; flex-wrap: wrap; gap: 6px; }
.map { flex: 1; }

/* Calendar page */
.simple-page { max-width: 560px; padding: 20px; }
select { padding: 8px; border: 1px solid #ccc; border-radius: 6px; background: white; }
button.ghost { background: transparent; color: #1d3557; border: 1px solid #1d3557; }
.card { background: white; border-radius: 10px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
.dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.dot.deadline { background: #1d3557; }
.dot.session { background: #1d355733; border-left: 3px solid #1d3557; border-radius: 2px; }

.cal-page { display: grid; grid-template-columns: 340px 1fr; gap: 20px; padding: 20px; align-items: start; }
.cal-side h2 { margin: 0; }
.cal-side .form, .simple-page .form { display: flex; flex-direction: column; gap: 10px; margin: 12px 0; }
.cal-side .row, .simple-page .row { display: grid; grid-template-columns: 1.4fr 0.8fr 1fr; gap: 8px; }
.cal-side .row input, .cal-side .row select, .simple-page .row input { width: 100%; }

.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.stats div { background: white; border-radius: 10px; padding: 10px; text-align: center; }
.stats b { display: block; font-size: 20px; }
.stats span { font-size: 12px; color: #666; }
.stats .bad b { color: #d62828; }

.warning { background: #fff3cd; padding: 10px; border-radius: 8px; margin: 10px 0; font-size: 13px; }
.warning ul { margin: 6px 0; padding-left: 18px; }
.plan-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 10px; margin-top: 10px; }
.plan-row input { width: 80px; }

.task-list { list-style: none; padding: 0; margin: 0; }
.task-list li { display: flex; gap: 10px; align-items: center; background: white; border-radius: 8px; padding: 8px 10px; margin-bottom: 6px; }
.task-list li.done { opacity: 0.5; }
.task-list li.done .task-title { text-decoration: line-through; }
.task-info { flex: 1; cursor: pointer; min-width: 0; }
.task-title { font-weight: 600; }
.task-meta { font-size: 12px; color: #666; display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.badge { font-size: 10px; padding: 1px 6px; border-radius: 10px; text-transform: uppercase; font-weight: 600; }
.badge.high { background: #fde2e4; color: #c1121f; }
.badge.medium { background: #fff1d6; color: #b5651d; }
.badge.low { background: #e3f2e1; color: #2d6a4f; }

.cal { background: white; border-radius: 10px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
.cal-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.cal-header h3 { margin: 0; flex: 1; text-align: center; }
.cal-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
.cal-weekday { text-align: center; font-size: 12px; font-weight: 600; color: #666; padding: 4px 0; }
.cal-cell { min-height: 96px; border: 1px solid #eee; border-radius: 6px; padding: 4px; cursor: pointer; overflow: hidden; }
.cal-cell:hover { border-color: #a8b8d0; }
.cal-cell.muted { background: #fafafa; color: #aaa; }
.cal-cell.past { opacity: 0.6; }
.cal-cell.today { border: 2px solid #1d3557; }
.cal-cell.selected { background: #eef3fb; }
.cal-day { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 3px; }
.cal-hours { font-weight: 500; color: #1d3557; background: #e8eef7; border-radius: 8px; padding: 0 5px; }
.chip { font-size: 11px; padding: 2px 5px; border-radius: 4px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chip.deadline { color: white; font-weight: 600; }
.chip.session { border-left: 3px solid; color: #333; }
.chip.done { text-decoration: line-through; opacity: 0.6; }
.chip.more { color: #666; }
.cal-legend { display: flex; gap: 16px; font-size: 12px; color: #666; margin-top: 8px; }
.cal-legend span { display: flex; align-items: center; gap: 6px; }

.day-details { margin-top: 12px; }
.day-details h3 { margin: 0 0 8px; }
.day-item { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 14px; }

@media (max-width: 900px) {
  .cal-page { grid-template-columns: 1fr; }
  .cal-cell { min-height: 70px; }
}

/* Login page (step 6) */
.login-page { min-height: 100vh; display: grid; place-items: center; padding: 20px; background: #1d3557; }
.login-card { width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 12px; padding: 24px; }
.login-card h2 { margin: 0; }
.login-card input { width: 100%; }
.error { background: #fde2e4; color: #c1121f; padding: 8px 10px; border-radius: 6px; font-size: 13px; margin: 0; }
.nav-user { margin-left: auto; font-size: 13px; color: #cfd8e3; }
```
</details>

## Q3. ✍️ Show the login page until you are logged in

Replace **`client/src/App.jsx`** with:

```jsx
import { useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';
import LoginPage from './pages/LoginPage.jsx';
import MapPage from './pages/MapPage.jsx';
import CalendarPage from './pages/CalendarPage.jsx';

const PAGES = {
  map: { label: '🗺️ 3D Map', component: MapPage },
  calendar: { label: '📅 AI Calendar', component: CalendarPage },
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
        <Page />
      </main>
    </div>
  );
}
```

- **`user`** state: `null` = logged out → show `LoginPage`; otherwise show the app
- **after a reload** the token is still in `localStorage`, but React forgot the user → we ask **`/api/auth/me`**. While waiting, `checking` shows *"Loading…"* (so the login page doesn't flash)
- **`login`** saves the token and the user; **`logout`** deletes both
- the nav shows your email and a **Log out** button (`margin-left: auto` pushes them to the right)

## Q4. 👀 Try it with two accounts

1. Refresh **http://localhost:5173** → the **login page**.
2. Click **Create one**, register with your email and a password (6+ characters) → you're in, your email is in the nav.
3. Add two tasks and a place on the map.
4. **Refresh** the page → still logged in.
5. Click **Log out** → login page. Try a **wrong password** → *"Wrong email or password"*.
6. Register a **second** account (e.g. `test2@example.com`) → the calendar is **empty**, the map has only the Brandenburg Gate. 🎉
7. Log out, log in with your first account → your tasks are back.

Open **Neon → Tables → users**: you see both accounts – and in `password_hash` only scrambled text like `$2b$10$...`, never the password.

```sql
SELECT id, email, password_hash FROM users;
SELECT title, user_id FROM tasks;
```

---

# 🎉 Your app has user accounts!

| Layer | What it does for login |
|---|---|
| Frontend | login page, keeps the token in `localStorage`, sends it with every request |
| Backend | hashes passwords, signs and checks tokens, filters every query by `user_id` |
| Database | `users` table, every task and place has an owner |

## 💪 Bonus exercises

**A.** Show *"Hi, lena"* instead of the full email in the nav. *(Hint: `user.email.split('@')[0]`.)*

**B.** Make the token last only 1 hour. Where do you change it? What happens in the app after it expires?

<details><summary>💡 Solution</summary>

In `server/src/middleware/auth.js`: `{ expiresIn: '1h' }`. After an hour, the next request gets a `401` → `api.js` deletes the token and fires `logout` → the login page appears.
</details>

**C.** Count the tasks per user in the Neon SQL Editor.

<details><summary>💡 Solution</summary>

```sql
SELECT users.email, COUNT(tasks.id) AS tasks
FROM users LEFT JOIN tasks ON tasks.user_id = users.id
GROUP BY users.email;
```
</details>

**D.** Add a **"Delete my account"** button. *(Hint: a `DELETE /api/auth/me` route with `DELETE FROM users WHERE id = $1` – thanks to `ON DELETE CASCADE` the tasks and places disappear too.)*

## 📖 Words you learned

| Word | Meaning |
|---|---|
| **Authentication** | proving who you are (log in) |
| **Authorization** | deciding what you may do (only your own tasks) |
| **Hash / bcrypt** | a one-way fingerprint of a password |
| **JWT (token)** | a signed text that says who you are; sent with every request |
| **`Authorization: Bearer …`** | the HTTP header that carries the token |
| **Middleware** | a function that runs before the route, e.g. the `requireAuth` doorman |
| **`localStorage`** | small browser storage that survives a reload |
| **Foreign key** | a column that points to a row in another table (`user_id` → `users.id`) |
| **`401` / `409`** | *not logged in* / *conflict* (e.g. email already registered) |

---

➡️ **Next:** [Lesson 7 – Go live](https://github.com/amirreza98/App-dev-course/tree/step-7-deploy#readme): put your app on the internet with Vercel, and let GitHub test every change.
