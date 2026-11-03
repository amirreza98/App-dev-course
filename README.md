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
| [6 · Login](https://github.com/amirreza98/App-dev-course/tree/step-6-auth#readme) | `step-6-auth` | ~70 min |
| [7 · Go live](https://github.com/amirreza98/App-dev-course/tree/step-7-deploy#readme) **📍 you are here** | `step-7-deploy` | ~75 min |
| [8 · Mobile app](https://github.com/amirreza98/App-dev-course/tree/step-8-mobile#readme) | `step-8-mobile` | ~3 h |

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

# Lesson 7 – Go live: deploy to Vercel (+ automatic tests)

| | |
|---|---|
| ⏱️ Time | ~75 min |
| 🏁 Start from | your code from Lesson 6 (or `git checkout -f step-7-deploy` for the finished result) |
| ✅ Finished result | branch `step-7-deploy` |
| 🎯 You will | put the app on the internet with a real link, and let GitHub test every change automatically |

> 🆘 **Stuck or behind?** Run `git checkout -f step-7-deploy && npm install`. You still need your own `server/.env` (Lessons 5 and 6).

---

## 💡 From "my laptop" to "the internet"

Today the app only runs while **your** laptop runs `npm run dev`. To share it, we need a computer that is always on: a **host**. We use **Vercel** (free for students).

| | On your laptop | On Vercel |
|---|---|---|
| Frontend | Vite dev server (`:5173`) | the built files (`npm run build` → `client/dist`) |
| Backend | `node src/index.js` runs all the time | a **serverless function**: starts only when a request comes in |
| Database | Neon | **the same** Neon |
| Secrets | `server/.env` | Vercel → **Environment Variables** |

**Serverless** means: no server waits all day. Vercel starts our Express app for a request, answers, and may stop it again. So our code must **not** call `app.listen()` itself on Vercel – Vercel does the listening.

```
Browser ──▶ app-dev-course-xyz.vercel.app
             ├── /            → client/dist/index.html (React)
             └── /api/...     → api/index.js → our Express app → Neon
```

---

# Part R – Make the server ready for Vercel

## R1. ✍️ Split the app from `listen()`

Create **`server/src/app.js`** – the whole Express app, but **without** `app.listen()`:

```js
import express from 'express';
import cors from 'cors';
import { initDb, missingSettings } from './db.js';
import { requireAuth } from './middleware/auth.js';
import authRouter from './routes/auth.js';
import placesRouter from './routes/places.js';
import tasksRouter from './routes/tasks.js';

// The Express app – WITHOUT app.listen().
// Locally index.js starts it; on Vercel, api/index.js hands it to Vercel.
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Before every other API request: settings present? tables created?
app.use('/api', async (req, res, next) => {
  const missing = missingSettings();
  if (missing.length) {
    return res.status(500).json({ error: `Server is not configured: ${missing.join(', ')} missing` });
  }
  await initDb(); // fast after the first time
  next();
});

// Login and registration – open to everyone
app.use('/api/auth', authRouter);

// Project 1: 3D Map – only for logged-in users
app.use('/api/places', requireAuth, placesRouter);

// Project 2: AI Calendar – only for logged-in users
app.use('/api/tasks', requireAuth, tasksRouter);

// If something fails, answer with a clear error instead of crashing
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

export default app;
```

- `export default app` – other files can now use the app
- the new middleware on `/api` checks the settings and creates the tables **on the first request**. On Vercel there is no "server start", so this is the right moment.
- if a setting is missing, you get a clear message like *"Server is not configured: DATABASE_URL missing"* instead of a crash

Replace **`server/src/index.js`** with – it is now only for your laptop:

```js
// Local development: check the settings, prepare the database, start listening.
import app from './app.js';
import { initDb, missingSettings } from './db.js';

const missing = missingSettings();
if (missing.length) {
  console.error(`❌ Missing in server/.env: ${missing.join(', ')} (see server/.env.example)`);
  process.exit(1);
}

try {
  await initDb();
} catch (err) {
  console.error('❌ Could not connect to the database. Check DATABASE_URL in server/.env');
  console.error(err.message);
  process.exit(1);
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
```

## R2. ✍️ No more `process.exit()` in `db.js`

On Vercel, stopping the process would kill every request. Replace **`server/src/db.js`** with:

```js
import pg from 'pg';

// Locally, settings come from server/.env. On Vercel they come from the project's
// "Environment Variables" – there is no .env file there, and that's fine.
try { process.loadEnvFile(); } catch { /* no .env file */ }

// Which required settings are missing? (empty list = all good)
export const missingSettings = () => ['DATABASE_URL', 'JWT_SECRET'].filter((name) => !process.env[name]);

// Return DATE columns as plain 'YYYY-MM-DD' text (not JavaScript Date objects)
pg.types.setTypeParser(1082, (value) => value);

// A pool keeps a few connections open and reuses them for every query
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Create the tables once. On Vercel the server starts again and again,
// so we remember the result and only do it the first time.
let ready = null;
export function initDb() {
  if (!ready) ready = createTables().catch((err) => { ready = null; throw err; });
  return ready;
}

async function createTables() {
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
  console.log('✅ Database ready');
}
```

- `missingSettings()` only **reports** missing settings – `index.js` (laptop) and `app.js` (Vercel) decide what to do
- `initDb()` remembers its result (`ready`), so the tables are created only once

**👀 Test it:** `npm run dev` → the app works exactly as before. Nothing changed for the user – only the structure.

## R3. ✍️ The Vercel function and settings

Create the folder **`api`** in the **root** folder (next to `client/` and `server/`) and in it the file **`api/index.js`**:

```js
// Vercel turns every file in the api/ folder into a serverless function.
// This one simply hands every /api/... request to our Express app.
import app from '../server/src/app.js';

export default app;
```

Vercel turns **every file in `api/`** into a serverless function. This one just hands over our Express app.

Create **`vercel.json`** in the **root** folder:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "outputDirectory": "client/dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- `buildCommand` / `outputDirectory` – build the React app and serve `client/dist`
- **rewrites**: every `/api/...` request goes to our function; every other address gets `index.html`, so React can show the page

---

# Part S – Automatic tests

## 💡 Why tests?

Every time you change something, you could break something else. Clicking through the whole app by hand after every change takes forever. **Tests** are small programs that check your code for you – in a second.

- **Unit test** – checks one function alone (our planner)
- **API test** – starts the real server and sends real requests

## S1. ✍️ Test the planner

Create the folder **`server/test`** and in it the file **`server/test/planner.test.js`**:

```js
// Unit tests: check the planner rules without a server or database.
// Run with:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ruleBasedPlan } from '../src/planner.js';

const TODAY = '2026-11-02';
const task = (id, deadline, hours, priority = 'medium') => ({ id, title: `Task ${id}`, deadline, hours, priority });

// Helper: all sessions of the plan as one flat list
const sessions = (plan) => Object.entries(plan.days).flatMap(([day, list]) => list.map((s) => ({ day, ...s })));

test('plans all hours of a task', () => {
  const plan = ruleBasedPlan([task(1, '2026-11-08', 6)], { today: TODAY });
  const total = sessions(plan).reduce((sum, s) => sum + s.hours, 0);
  assert.equal(total, 6);
  assert.deepEqual(plan.atRisk, []);
});

test('never plans work on the deadline day or later', () => {
  const plan = ruleBasedPlan([task(1, '2026-11-05', 4)], { today: TODAY });
  for (const s of sessions(plan)) assert.ok(s.day < '2026-11-05', `session on ${s.day}`);
});

test('spreads work over several days (not everything today)', () => {
  const plan = ruleBasedPlan([task(1, '2026-11-08', 6)], { today: TODAY });
  assert.ok(Object.keys(plan.days).length >= 3);
});

test('sessions are at most 1.5 hours', () => {
  const plan = ruleBasedPlan([task(1, '2026-11-04', 6)], { maxHoursPerDay: 6, today: TODAY });
  for (const s of sessions(plan)) assert.ok(s.hours <= 1.5, `${s.hours}h session`);
});

test('respects the daily limit', () => {
  const plan = ruleBasedPlan([task(1, '2026-11-06', 8), task(2, '2026-11-06', 8)], { maxHoursPerDay: 3, today: TODAY });
  for (const [day, list] of Object.entries(plan.days)) {
    const hours = list.reduce((sum, s) => sum + s.hours, 0);
    assert.ok(hours <= 3, `${hours}h on ${day}`);
  }
});

test('warns when a task does not fit', () => {
  const plan = ruleBasedPlan([task(1, '2026-11-03', 10)], { maxHoursPerDay: 4, today: TODAY });
  assert.equal(plan.atRisk.length, 1);
  assert.equal(plan.atRisk[0].missingHours, 6);
});
```

- `test('name', () => { ... })` – one test = one rule of the planner
- `assert.equal(a, b)` – *"a must be b, otherwise the test fails"*
- the tests use a fixed `TODAY`, so they give the same result every day

## S2. ✍️ Test the API

Create **`server/test/api.test.js`**:

```js
// API tests: start the real Express app and send real HTTP requests.
// Needs DATABASE_URL and JWT_SECRET (from server/.env, or from GitHub Actions).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { pool } from '../src/db.js';

let server, base;

before(async () => {
  server = app.listen(0);                                   // 0 = any free port
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://localhost:${server.address().port}/api`;
});

after(async () => {
  server.close();
  await pool.end();
});

// Small helper: send a request, return { status, body }
async function call(method, path, body, token) {
  const res = await fetch(base + path, {
    method,
    headers: {
      ...(body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, body: res.status === 204 ? null : await res.json() };
}

const email = (name) => `${name}-${Date.now()}@test.de`;

test('health check works', async () => {
  const res = await call('GET', '/health');
  assert.equal(res.status, 200);
});

test('tasks need a login', async () => {
  const res = await call('GET', '/tasks');
  assert.equal(res.status, 401);
});

test('register, create a task, and read it back', async () => {
  const reg = await call('POST', '/auth/register', { email: email('lena'), password: 'secret123' });
  assert.equal(reg.status, 201);
  const token = reg.body.token;

  const created = await call('POST', '/tasks', { title: 'Thesis', deadline: '2030-01-10', hours: 6 }, token);
  assert.equal(created.status, 201);

  const list = await call('GET', '/tasks', null, token);
  assert.equal(list.body.length, 1);
  assert.equal(list.body[0].title, 'Thesis');
});

test('wrong password is refused', async () => {
  const address = email('omar');
  await call('POST', '/auth/register', { email: address, password: 'secret123' });
  const res = await call('POST', '/auth/login', { email: address, password: 'nope-nope' });
  assert.equal(res.status, 401);
});

test('users only see their own tasks', async () => {
  const a = (await call('POST', '/auth/register', { email: email('a'), password: 'secret123' })).body.token;
  const b = (await call('POST', '/auth/register', { email: email('b'), password: 'secret123' })).body.token;
  const task = (await call('POST', '/tasks', { title: 'Private', deadline: '2030-01-10', hours: 2 }, a)).body;

  assert.equal((await call('GET', '/tasks', null, b)).body.length, 0);
  assert.equal((await call('PATCH', `/tasks/${task.id}`, { done: true }, b)).status, 404);
});
```

- `app.listen(0)` starts the real app on any free port – that's why we split `app.js` from `index.js`!
- the last test proves the most important rule of Lesson 6: **Omar can't touch Lena's task**

## S3. ✍️ Run the tests

Replace **`server/package.json`** with (new: the `test` script):

```json
{
  "name": "server",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js",
    "test": "node --test"
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

Replace the **root** **`package.json`** with:

```json
{
  "name": "app-dev-course",
  "private": true,
  "type": "module",
  "workspaces": ["client", "server"],
  "scripts": {
    "dev": "concurrently -n server,client -c blue,green \"npm run dev -w server\" \"npm run dev -w client\"",
    "build": "npm run build -w client",
    "test": "npm test -w server"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

- `"type": "module"` – lets `api/index.js` use `import`, like the rest of our code
- `"test"` – `npm test` in the root folder runs the server tests

Run:

```bash
npm test
```

👀 **You see:**

```
# tests 11
# pass 11
# fail 0
```

🧪 Break something on purpose: in `server/src/planner.js` change `const SESSION_HOURS = 1.5;` to `3`, run `npm test` → a test fails and tells you which rule broke. Change it back.

## S4. ✍️ Let GitHub run the tests: GitHub Actions

Create the folders **`.github/workflows`** in the root folder and in them the file **`.github/workflows/ci.yml`**:

```yaml
# Runs automatically on GitHub every time someone pushes code.
# Green check = the app builds and all tests pass. Red cross = something broke.
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    # A throw-away PostgreSQL database just for the tests
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: course
          POSTGRES_PASSWORD: course
          POSTGRES_DB: appdev
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready --health-interval 5s --health-timeout 5s --health-retries 10

    env:
      DATABASE_URL: postgresql://course:course@localhost:5432/appdev
      JWT_SECRET: ci-test-secret

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci           # install exactly the versions in package-lock.json
      - run: npm run build    # does the frontend build?
      - run: npm test         # planner + API tests
```

**CI** (Continuous Integration) = on every `git push`, GitHub starts a fresh computer, installs your project, builds it and runs the tests – with its own throw-away database.

Push your code:

```bash
git add .
git commit -m "Lesson 7: ready for Vercel, tests and CI"
git push
```

Open your repository on GitHub → tab **Actions**. After about a minute: a green ✅ next to your commit. Red ❌ = click it and read which step failed.

> No GitHub repository of your own yet? Do **T1** below first, then come back.

---

# Part T – Go live

You do these steps once, in the browser. Keep this page open next to it.

## T1. Put your code on GitHub

Vercel deploys straight from GitHub, so your code must be there.

- **You cloned the course repo?** Make it your own: on GitHub click **New repository** (name: `app-dev-course`, **without** README), then in your project folder:

```bash
git remote set-url origin https://github.com/YOUR-USERNAME/app-dev-course.git
git push -u origin --all
```

- **You built it yourself from Lesson 0?** Create the repository the same way, then:

```bash
git remote add origin https://github.com/YOUR-USERNAME/app-dev-course.git
git push -u origin --all
```

✅ On GitHub you see your files, including **`vercel.json`** and the **`api/`** folder.

> Work on a branch, e.g. `step-7-deploy`? That's fine – remember its name, you need it in T4.

## T2. Create the project on Vercel

1. Go to **https://vercel.com** → **Sign Up** → **Continue with GitHub**.
2. **Add New… → Project**. In the list, find **app-dev-course** → **Import**.
   *(Not in the list? Click **Adjust GitHub App Permissions** and allow access to the repository.)*
3. On the **Configure Project** screen, set exactly:

| Setting | Value |
|---|---|
| **Project Name** | anything, e.g. `app-dev-course-yourname` – this becomes your link |
| **Framework Preset** | **Other** |
| **Root Directory** | `./` – leave it! **Not** `client` |
| Build / Output / Install | don't touch – `vercel.json` sets them |

4. Open **Environment Variables** and add one variable:
   - Key **`JWT_SECRET`**, Value: a new random text from

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. Click **Deploy**.

👀 After about a minute you get a link. The first version may show *"Server is not configured: DATABASE_URL missing"* when you try to register – correct, there is no database yet.

## T3. Add the database (inside Vercel)

1. In your project, open the tab **Storage** → **Create Database** → **Neon** (Serverless Postgres) → **Continue**.
2. Plan **Free**, region **Frankfurt (fra1)** or the closest → **Create**.
3. **Connect Project**: choose your project, tick **Production** and **Preview** → **Connect**.

Vercel now adds **`DATABASE_URL`** (and some other `PG…` variables) to your project automatically. Check it: **Settings → Environment Variables** – you see `DATABASE_URL` and `JWT_SECRET`.

> Want the same data as on your laptop? Copy the connection string from Neon (**Connect**) into your `server/.env` as `DATABASE_URL`.

## T4. Tell Vercel which branch is "live"

Vercel calls the live version **Production**. By default it uses the branch **`main`**.

- Your finished code is on **`main`** → nothing to do.
- Your finished code is on another branch (e.g. `step-7-deploy`) → **Settings → Environments → Production → Branch Tracking** → enter the branch name → **Save**.

> ⚠️ Branches from older lessons have no `vercel.json` and **will show red ❌ builds** on Vercel. That's expected and harmless – only the production branch matters.

## T5. Deploy again with the database

Environment variables are only read when a version is **built**, so build once more:

**Deployments** → the newest deployment **of your production branch** (check the branch name next to it!) → **⋯** → **Redeploy** → **Redeploy**.

## T6. 👀 Check your live app

Your link is shown on the project page, e.g. `https://app-dev-course-yourname.vercel.app`.

1. **`<your link>/api/health`** → `{"ok":true}` → the Express function runs on Vercel.
2. **`<your link>`** → login page → **Create one** → register → you're in. 🎉
3. Add a task, save a place on the map, refresh → still there (Neon!).
4. Send the link to a classmate: they register and see **their own, empty** calendar.

**Look behind the scenes:** project → **Logs**. You see every API request, and `✅ Database ready` after the first one.

## T7. Troubleshooting

| You see | Why | Fix |
|---|---|---|
| `Server is not configured: DATABASE_URL missing` | no database, or not redeployed after adding it | T3, then T5 |
| `Server is not configured: JWT_SECRET missing` | variable forgotten | **Settings → Environment Variables** → add it → T5 |
| Build error *"No Output Directory named dist"* or *"…named public"* | wrong **Root Directory**, or you built an old branch without `vercel.json` | Root Directory `./` (**Settings → Build and Deployment**); redeploy the right branch |
| Classmates see a **Vercel login page** | Deployment Protection is on | **Settings → Deployment Protection → Vercel Authentication** → off for Production, or share the production link (not a preview link) |
| Page loads, but every action fails | error in the function | project → **Logs** → read the red line |
| A warning *"SECURITY WARNING: The SSL modes…"* in the logs | only a notice from the `pg` library | nothing to do |

## T8. From now on: push = deploy

Vercel is connected to GitHub:

- `git push` to your **production branch** → the live version is updated in ~1 minute
- push to any other branch → a separate **preview** link to test first

Try it: change the heading in `CalendarPage.jsx`, commit, push – GitHub Actions tests it ✅, Vercel deploys it 🚀.

---

# 🎉 Your app is live!

You went through the whole life cycle: plan → requirements → design → **build** → **test** → **deploy**. Compare it with the six phases on the [Miro board](https://miro.com/app/board/uXjVHeLSHBw=/?share_link_id=439689196857).

## 💪 Bonus exercises

**A.** Add a test: *"a task with a deadline in the past is at risk"*. Run `npm test`.

**B.** Add a status badge to your README: in GitHub → **Actions → CI → ⋯ → Create status badge**.

**C.** Give your app a nicer address: Vercel → **Settings → Domains** → edit the `.vercel.app` name.

**D.** Make a small change on a new branch, push it, and open the **preview link** Vercel creates. Merge it into `main` when you like it.

## 📖 Words you learned

| Word | Meaning |
|---|---|
| **Deploy** | put your app on a server so others can use it |
| **Host / Vercel** | the company whose computers run your app |
| **Serverless function** | code that starts only when a request comes in |
| **Build** | turn the source code into optimized files for the browser |
| **Environment variable** | a setting (like a secret) stored on the host, not in the code |
| **Rewrite** | a rule that sends a URL to a different file or function |
| **Unit test / API test** | a program that checks one function / the real server |
| **CI (GitHub Actions)** | tests run automatically on every push |
| **Production / Preview** | the real live version / a test version for one branch |

---

➡️ **Next:** [Lesson 8 – The mobile app](https://github.com/amirreza98/App-dev-course/tree/step-8-mobile#readme): your project on your phone with React Native and Expo.
