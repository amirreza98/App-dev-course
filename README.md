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
| [5 · Database](https://github.com/amirreza98/App-dev-course/tree/step-5-database#readme) **📍 you are here** | `step-5-database` | ~60 min |
| [6 · Login](https://github.com/amirreza98/App-dev-course/tree/step-6-auth#readme) | `step-6-auth` | ~70 min |
| [7 · Go live](https://github.com/amirreza98/App-dev-course/tree/step-7-deploy#readme) | `step-7-deploy` | ~75 min |
| [8 · Mobile app](https://github.com/amirreza98/App-dev-course/tree/step-8-mobile#readme) | `step-8-mobile` | ~3 h |
| [9 · Reminders](https://github.com/amirreza98/App-dev-course/tree/step-9-reminders#readme) | `step-9-reminders` | ~60 min |
| [10 · Campus 3D + VR](https://github.com/amirreza98/App-dev-course/tree/step-10-campus-3d#readme) | `step-10-campus-3d` | ~90 min |

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

# Lesson 5 – A real database: data that survives

| | |
|---|---|
| ⏱️ Time | ~60 min |
| 🏁 Start from | your code from Lesson 4 (or `git checkout -f step-4-planner`) |
| ✅ Finished result | branch `step-5-database` |
| 🎯 You will | store tasks and places in a **PostgreSQL** database, so nothing is lost when the server restarts |

> 🆘 **Stuck or behind?** Run `git checkout -f step-5-database && npm install`, then do **M1–M2** below (your own database and `.env` file).

---

## 💡 The problem: our server forgets everything

Try it: add a task, stop the app (**Control + C**), start it again (`npm run dev`). **Your task is gone.** 😱

Until now our data lived in a JavaScript array – in the server's memory. Memory is wiped every time the server stops.

| | Whiteboard 🧽 | Notebook 📓 |
|---|---|---|
| Today | array in memory | |
| After this lesson | | **database** on a disk |
| Server restarts | wiped | still there |

## 💡 What is a database?

A database stores data in **tables** – like sheets in Excel:

**Table `tasks`**

| id | title | deadline | hours | priority | done |
|---|---|---|---|---|---|
| 1 | Thesis chapter | 2026-11-20 | 8 | high | false |
| 2 | Exam prep | 2026-11-12 | 5 | medium | true |

- a **table** = one kind of thing (tasks, places)
- a **column** = one property, with a fixed type (text, date, number, true/false)
- a **row** = one item
- **id** = a unique number for each row (the **primary key**)

We talk to the database in **SQL** – a short language that reads almost like English:

```sql
SELECT * FROM tasks;                                   -- read all rows
INSERT INTO tasks (title, deadline, hours) VALUES ('Read paper', '2026-11-15', 3);  -- add a row
UPDATE tasks SET done = true WHERE id = 2;             -- change a row
DELETE FROM tasks WHERE id = 2;                        -- remove a row
```

We use **PostgreSQL**, one of the most popular databases in the world, hosted for free by **Neon** – so you don't have to install anything.

---

# Part M – Get your own database

## M1. Create a free Neon database

1. Go to **https://neon.tech** and sign up (GitHub or Google login works, no credit card).
2. Create a project: name **`app-dev-course`**, region **Europe (Frankfurt)**.
3. On the project dashboard, click **Connect**.
4. Copy the **connection string**. It looks like this:

```
postgresql://neondb_owner:AbC123xyz@ep-cool-name-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

> 🔐 This string contains your **password**. Treat it like an API key: never post it in chat, never put it in your code.

## M2. Put it in `server/.env`

You already know `.env` from Lesson 4 – it holds secrets and is **never** uploaded to GitHub (it is listed in `.gitignore`).

**1.** Replace **`server/.env.example`** with:

```bash
PORT=3001

# Your Neon PostgreSQL connection string (neon.tech -> your project -> Connect)
# It looks like: postgresql://user:password@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
DATABASE_URL=

# Optional: set this to let the calendar planner use a real LLM.
# Without it, a simple rule-based planner is used.
OPENAI_API_KEY=
```

**2.** Open your **`server/.env`** (create it if you don't have one) and add the line with **your** connection string:

```bash
DATABASE_URL=postgresql://neondb_owner:AbC123xyz@ep-cool-name-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

Keep your `OPENAI_API_KEY` line if you have one.

## M3. Install the database driver

Stop the app (**Control + C**), then:

```bash
npm install pg -w server
```

- **`pg`** is the package Node.js uses to talk to PostgreSQL
- `-w server` installs it in the **server** part of the project (look: it appears in `server/package.json`)

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
    "cors": "^2.8.5",
    "express": "^5.3.0",
    "pg": "^8.23.1"
  }
}
```
</details>

---

# Part N – Connect to the database

## N1. ✍️ The database connection: `db.js`

Create a new file **`server/src/db.js`**:

```js
import pg from 'pg';

// Load server/.env (DATABASE_URL lives there)
try { process.loadEnvFile(); } catch { /* no .env file */ }

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is missing. Copy server/.env.example to server/.env and paste your Neon connection string.');
  process.exit(1);
}

// Return DATE columns as plain 'YYYY-MM-DD' text (not JavaScript Date objects)
pg.types.setTypeParser(1082, (value) => value);

// A pool keeps a few connections open and reuses them for every query
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Create the tables the first time the server starts
export async function initDb() {
  try {
    await pool.query(`
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
    `);

    // First start: add one example place so the map is not empty
    const { rows } = await pool.query('SELECT COUNT(*) FROM places');
    if (Number(rows[0].count) === 0) {
      await pool.query(
        'INSERT INTO places (name, lng, lat) VALUES ($1, $2, $3)',
        ['Brandenburg Gate', 13.3777, 52.5163]
      );
    }
  } catch (err) {
    console.error('❌ Could not connect to the database. Check DATABASE_URL in server/.env');
    console.error(err.message);
    process.exit(1);
  }
  console.log('✅ Database ready');
}
```

What happens here:

- **`pool`** – a set of open connections to the database. Every route borrows one, runs a query, and gives it back.
- **`initDb()`** – runs once when the server starts:
  - `CREATE TABLE IF NOT EXISTS` creates the tables – but only the first time
  - `SERIAL PRIMARY KEY` → the database gives every new row the next id (1, 2, 3 …) by itself
  - `NOT NULL` → this column must always have a value
  - `DEFAULT false` → the value if we don't send one
  - if the table `places` is empty, it adds the Brandenburg Gate as an example
- the two `❌` messages tell you **exactly** what is wrong if `.env` is missing or the connection string is wrong

## N2. ✍️ Start the database when the server starts

Replace **`server/src/index.js`** with:

```js
import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import placesRouter from './routes/places.js';
import tasksRouter from './routes/tasks.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Project 1: 3D Map
app.use('/api/places', placesRouter);

// Project 2: AI Calendar
app.use('/api/tasks', tasksRouter);

// If a database query fails, answer with a clear error instead of crashing
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Database error' });
});

const PORT = process.env.PORT || 3001;
await initDb();
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
```

- `await initDb()` – first make sure the tables exist, **then** start listening for requests
- the new `app.use((err, req, res, next) => …)` at the end catches any database error and answers with a clear message instead of crashing

> ⚠️ The routes still use the old arrays: the app works, but nothing is saved in the database yet. That's next.

## N3. 👀 Look inside your database

Start the app:

```bash
npm run dev
```

In the terminal you should see:

```
[server] ✅ Database ready
[server] API running on http://localhost:3001
```

Now open **Neon → Tables** in the browser. You see two new tables: **`places`** and **`tasks`**. Click **places** → there is one row: Brandenburg Gate. 🎉

> ❌ See `Could not connect to the database`? Check `DATABASE_URL` in `server/.env`: the whole string, no spaces, no quotes, on one line.

---

# Part O – Use the database in the routes

## 💡 Two new ideas before we start

**1. `async` / `await`** – asking the database takes a moment (it is on another computer). `await` means *"wait for the answer, then continue"*. A function that uses `await` must be marked `async`.

```js
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM places');   // wait for the database
  res.json(result.rows);                                      // rows = the list of results
});
```

**2. `$1, $2, $3` placeholders** – we **never** glue user input into SQL ourselves:

```js
// ❌ DANGEROUS – a user could type SQL into the name field ("SQL injection")
pool.query(`INSERT INTO places (name) VALUES ('${name}')`);

// ✅ SAFE – pg sends the values separately, the database treats them as plain data
pool.query('INSERT INTO places (name, lng, lat) VALUES ($1, $2, $3)', [name, lng, lat]);
```

`RETURNING *` at the end of an `INSERT` or `UPDATE` sends back the row as it is now stored – including the new `id`.

## O1. ✍️ Places in the database

Replace **`server/src/routes/places.js`** with:

```js
import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// GET /api/places -> all saved places
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM places ORDER BY id');
  res.json(result.rows);
});

// POST /api/places -> save a new place. Body: { name, lng, lat }
router.post('/', async (req, res) => {
  const { name, lng, lat } = req.body;
  if (!name || lng == null || lat == null) {
    return res.status(400).json({ error: 'name, lng and lat are required' });
  }
  const result = await pool.query(
    'INSERT INTO places (name, lng, lat) VALUES ($1, $2, $3) RETURNING *',
    [name, Number(lng), Number(lat)]
  );
  res.status(201).json(result.rows[0]);
});

// DELETE /api/places/:id -> remove a place
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM places WHERE id = $1', [Number(req.params.id)]);
  res.status(204).end();
});

export default router;
```

Compare with the old file: the array `let places = [...]` is gone. Every route is now **one SQL query**.

**👀 Test it:**

1. Open the **3D Map** and click on the map to save a new place.
2. Stop the app (**Control + C**) and start it again (`npm run dev`).
3. Refresh the browser → **your pin is still there!** 🎉
4. In **Neon → Tables → places**, your new row is there too.

## O2. ✍️ Tasks in the database

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

// GET /api/tasks -> list all tasks
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks ORDER BY deadline, id');
  res.json(result.rows.map(withColor));
});

// POST /api/tasks -> create a task. Body: { title, deadline, hours, priority }
router.post('/', async (req, res) => {
  const { title, deadline, hours, priority = 'medium' } = req.body;
  if (!title || !deadline || !hours) {
    return res.status(400).json({ error: 'title, deadline and hours are required' });
  }
  const result = await pool.query(
    `INSERT INTO tasks (title, deadline, hours, priority)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, deadline, Number(hours), PRIORITIES.includes(priority) ? priority : 'medium']
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
     WHERE id = $6
     RETURNING *`,
    [
      title ?? null,
      deadline ?? null,
      hours !== undefined ? Number(hours) : null,
      PRIORITIES.includes(priority) ? priority : null,
      done !== undefined ? Boolean(done) : null,
      Number(req.params.id),
    ]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
  res.json(withColor(result.rows[0]));
});

// DELETE /api/tasks/:id -> remove a task
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id = $1', [Number(req.params.id)]);
  res.status(204).end();
});

// POST /api/tasks/plan -> build a schedule that spreads work out BEFORE the deadline.
// Body: { maxHoursPerDay, useAi, today: 'YYYY-MM-DD' }
router.post('/plan', async (req, res) => {
  const maxHoursPerDay = Number(req.body?.maxHoursPerDay) || 4;
  const useAi = Boolean(req.body?.useAi);
  const today = /^\d{4}-\d{2}-\d{2}$/.test(req.body?.today) ? req.body.today : undefined;
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE done = false');
    const plan = await planTasks(result.rows.map(withColor), { maxHoursPerDay, useAi, today });
    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Planning failed' });
  }
});

export default router;
```

What's new:

- **`ORDER BY deadline, id`** – the database sorts the tasks for us
- **`withColor`** – the colour is not stored; we calculate it from the id, like before
- **`COALESCE($1, title)`** in the `UPDATE` means *"use the new value – or, if it is empty (`null`), keep the old one"*. So `{ done: true }` changes only `done`.
- **`WHERE done = false`** – the planner now gets only open tasks straight from the database
- if `UPDATE` finds no row, `result.rows` is empty → we answer **404**

**👀 Test it:**

1. Open **AI Calendar**, add 2–3 tasks, mark one as **done**.
2. Restart the app (**Control + C**, `npm run dev`) and refresh the browser → all tasks are still there, the done one is still crossed out. The plan on the calendar is the same. 🎉
3. Open **Neon → SQL Editor** and run:

```sql
SELECT * FROM tasks;
```

You see exactly the tasks from your app – the frontend did not change at all, only where the server keeps the data.

---

# 🎉 Your data survives!

Your app now has all three classic layers:

| Layer | Technology | Job |
|---|---|---|
| Frontend | React (`client/`) | what the user sees |
| Backend | Express (`server/`) | rules, planner, API |
| **Database** | PostgreSQL on Neon | keeps the data – *new!* |

## 💪 Bonus exercises

**A.** In the Neon SQL Editor, write a query that shows only **high-priority** tasks that are **not done**.

<details><summary>💡 Solution</summary>

```sql
SELECT * FROM tasks WHERE priority = 'high' AND done = false;
```
</details>

**B.** Add a new endpoint `GET /api/tasks/stats` that returns how many tasks are open and how many are done.

<details><summary>💡 Solution</summary>

In `tasks.js`, **above** `router.patch('/:id', …)`:

```js
router.get('/stats', async (req, res) => {
  const result = await pool.query(`
    SELECT COUNT(*) FILTER (WHERE done = false) AS open,
           COUNT(*) FILTER (WHERE done = true)  AS done
    FROM tasks
  `);
  res.json(result.rows[0]);
});
```

Open http://localhost:3001/api/tasks/stats to see the result.
</details>

**C.** Add a column `created_at` that stores when a task was created. *(Hint: `ALTER TABLE tasks ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();` in the SQL Editor.)*

**D.** Search places: `GET /api/places?search=gate` returns only places whose name contains the word. *(Hint: `WHERE name ILIKE $1` with the value `'%' + search + '%'`.)*

## 📖 Words you learned

| Word | Meaning |
|---|---|
| **Database** | a program that stores data safely on disk |
| **PostgreSQL** | a popular open-source database |
| **Table / row / column** | a sheet / one item / one property |
| **Primary key** | the unique id of each row |
| **SQL** | the language to read and change data: `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| **Connection string** | the address + password of your database |
| **Connection pool** | open connections that are reused for every query |
| **`async` / `await`** | wait for a slow answer (like the database) without blocking |
| **SQL injection** | an attack where user input is run as SQL – prevented by `$1` placeholders |
| **`RETURNING *`** | send back the row after `INSERT` / `UPDATE` |

---

➡️ **Next:** [Lesson 6 – User accounts](https://github.com/amirreza98/App-dev-course/tree/step-6-auth#readme): register, log in, and everyone sees only their own tasks and places.
