# App Development Course – Build two real apps

We build two apps **step by step, with our own hands**: a 🗺️ **3D Map** and a 📅 **AI Calendar** (for people who leave everything to the last minute).
**Tools:** React + Vite · Node.js + Express · MapLibre

> 📋 **Start here: [Project plan on Miro](https://miro.com/app/board/uXjVHeLSHBw=/?share_link_id=439689196857)**. Before we write any code, we walk through the full software development life cycle of this project: Planning → Requirements → Design → Development → Testing → Deployment & Maintenance.

| Step (open its tutorial) | Branch | Time |
|---|---|---|
| [0 · Your first React app](https://github.com/amirreza98/App-dev-course/tree/main#readme) | `main` | ~30 min |
| [1 · React basics](https://github.com/amirreza98/App-dev-course/tree/step-1-react#readme) | `step-1-react` | ~60 min |
| [2 · Backend](https://github.com/amirreza98/App-dev-course/tree/step-2-backend#readme) | `step-2-backend` | ~60 min |
| [3 · Calendar](https://github.com/amirreza98/App-dev-course/tree/step-3-calendar#readme) | `step-3-calendar` | ~50 min |
| [4 · Planner + AI](https://github.com/amirreza98/App-dev-course/tree/step-4-planner#readme) **📍 you are here** | `step-4-planner` | ~50 min |

**How it works:** this page is the tutorial for this step. Follow it from top to bottom: copy each code block into your file → **save** → look at the browser. You keep working in your own code from step to step. The branch holds the **finished code** of the step – if you fall behind, catch up with `git checkout -f <branch> && npm install`.

<details>
<summary><b>⚙️ First time? Setup</b></summary>

1. Install **Node.js** (LTS, 20.19 or newer): https://nodejs.org and **VS Code**: https://code.visualstudio.com
2. In a terminal:

```bash
git clone https://github.com/amirreza98/App-dev-course.git
cd App-dev-course
npm install
npm run dev
```

3. Open **http://localhost:5173**. Stop the app with **Control + C**.
</details>

---

# Lesson 4 – The planner: spreading work out (+ AI)

| | |
|---|---|
| ⏱️ Time | ~50 min |
| 🏁 Start from | your code from Lesson 3 (or `git checkout -f step-3-calendar && npm install`) |
| ✅ Finished result | branch `step-4-planner` |
| 🎯 You will | write the algorithm that plans **when** to work on each task – in three versions – and connect an AI |

> 🆘 **Stuck or behind?** Run `git checkout -f step-4-planner && npm install` to get the finished app.

---

## 💡 Where does the planner live?

The planner is the **brain** of the app – the rules (*"max 4 hours per day"*). We put it on the **server**:

- the frontend stays simple: it only **shows** the plan
- the rules live in one place (a phone app could use the same server later)
- the secret AI key (Part K) must **never** be in the browser, where anyone can read it

The plan the server sends back looks like this:

```json
{
  "source": "rule-based",
  "days": {
    "2026-10-26": [{ "taskId": 1, "title": "Thesis", "hours": 1.5 }],
    "2026-10-27": [{ "taskId": 1, "title": "Thesis", "hours": 1.5 }]
  },
  "atRisk": []
}
```

---

# Part I – Show a plan on the calendar

## I1. ✍️ Planner version 1: panic mode 😱

Create **`server/src/planner.js`**:

```js
// Planner for the AI Calendar.
// Idea: people who procrastinate need the work split into small sessions
// that start NOW and finish a day BEFORE the deadline (buffer day).

const toDateStr = (d) => d.toISOString().slice(0, 10);

// Version 1: the "panic" planner – do everything today!
export function ruleBasedPlan(tasks, { today: todayStr } = {}) {
  const today = todayStr || toDateStr(new Date());
  const days = {};
  for (const task of tasks) {
    (days[today] ||= []).push({ taskId: task.id, title: task.title, hours: task.hours });
  }
  return { source: 'rule-based', days, atRisk: [] };
}

export async function planTasks(tasks, options) {
  return ruleBasedPlan(tasks, options);
}
```

The simplest possible plan: **everything today**. It's terrible – that's the point. We'll improve it step by step.

Now add a route. In **`server/src/routes/tasks.js`**, import the planner at the top:

```js
import { planTasks } from '../planner.js';
```

and add this route **at the end**, just above `export default router;`:

```js
// POST /api/tasks/plan -> build a schedule that spreads work out BEFORE the deadline.
// Body: { maxHoursPerDay, useAi, today: 'YYYY-MM-DD' }
router.post('/plan', async (req, res) => {
  const maxHoursPerDay = Number(req.body?.maxHoursPerDay) || 4;
  const useAi = Boolean(req.body?.useAi);
  const today = /^\d{4}-\d{2}-\d{2}$/.test(req.body?.today) ? req.body.today : undefined;
  try {
    const open = tasks.filter((t) => !t.done);
    const plan = await planTasks(open, { maxHoursPerDay, useAi, today });
    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Planning failed' });
  }
});
```

- only **open** tasks are planned – done tasks need no more time
- `today` comes from the browser, so the user's time zone is used
- `?.` means *"if `body` is missing, don't crash – just give `undefined`"*
- `/^\d{4}-\d{2}-\d{2}$/` is a **regular expression**: a pattern that checks the text looks like `2026-10-26`
- `maxHoursPerDay` and `useAi` aren't used yet – soon!
- `try { … } catch (err) { … }` – if anything inside crashes, send a `500` instead of killing the server

Nothing visible yet – next block!

---

## I2. ✍️ Show work sessions on the calendar

**In `client/src/components/MonthCalendar.jsx`** – the calendar learns a second kind of event: `kind: 'session'` (a planned work block).

**1.** Inside each day, under `const list = ...`, add up the planned hours:

```jsx
          const hours = list.filter((e) => e.kind === 'session').reduce((s, e) => s + e.hours, 0);
```

**2.** Show them next to the day number:

```jsx
              <div className="cal-day">
                <span>{day}</span>
                {hours > 0 && <span className="cal-hours">{hours}h</span>}
              </div>
```

**3.** Replace the chip `<div>` – deadlines stay filled with colour, sessions get a light background with a coloured edge:

```jsx
                <div
                  key={e.key}
                  className={`chip ${e.kind} ${e.done ? 'done' : ''}`}
                  style={e.kind === 'deadline'
                    ? { background: e.color }
                    : { borderLeftColor: e.color, background: e.color + '22' }}
                  title={e.label}
                >
                  {e.kind === 'deadline' ? '🏁 ' : ''}{e.label}
                </div>
```

(`e.color + '22'` adds transparency to the colour: `#4361ee` → `#4361ee22`)

**4.** Above `const title = ...`, add:

```jsx
  const hasSessions = Object.values(events).some((list) => list.some((e) => e.kind === 'session'));
```

and after the closing `</div>` of `cal-grid`, a small legend:

```jsx
      <div className="cal-legend">
        <span><i className="dot deadline" /> Deadline</span>
        {hasSessions && <span><i className="dot session" /> Planned work session</span>}
      </div>
```

<details>
<summary>✅ <b>Checkpoint:</b> <code>MonthCalendar.jsx</code> (final version)</summary>

```jsx
import { monthGrid, todayYMD } from '../utils/dates.js';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_CHIPS = 3;

/**
 * Month view.
 * events: { 'YYYY-MM-DD': [{ key, label, color, kind: 'deadline' | 'session', done }] }
 */
export default function MonthCalendar({ month, onMonthChange, events, selected, onSelect }) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const today = todayYMD();
  const cells = monthGrid(year, m);

  const shift = (n) => onMonthChange(new Date(year, m + n, 1));
  const title = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const hasSessions = Object.values(events).some((list) => list.some((e) => e.kind === 'session'));

  return (
    <div className="cal">
      <div className="cal-header">
        <button onClick={() => shift(-1)}>‹</button>
        <h3>{title}</h3>
        <button onClick={() => shift(1)}>›</button>
        <button className="ghost" onClick={() => { onMonthChange(new Date()); onSelect(today); }}>
          Today
        </button>
      </div>

      <div className="cal-grid">
        {WEEKDAYS.map((w) => <div key={w} className="cal-weekday">{w}</div>)}

        {cells.map(({ ymd, day, inMonth }) => {
          const list = events[ymd] || [];
          const hours = list.filter((e) => e.kind === 'session').reduce((s, e) => s + e.hours, 0);
          const classes = [
            'cal-cell',
            !inMonth && 'muted',
            ymd < today && 'past',
            ymd === today && 'today',
            ymd === selected && 'selected',
          ].filter(Boolean).join(' ');

          return (
            <div key={ymd} className={classes} onClick={() => onSelect(ymd)}>
              <div className="cal-day">
                <span>{day}</span>
                {hours > 0 && <span className="cal-hours">{hours}h</span>}
              </div>
              {list.slice(0, MAX_CHIPS).map((e) => (
                <div
                  key={e.key}
                  className={`chip ${e.kind} ${e.done ? 'done' : ''}`}
                  style={e.kind === 'deadline'
                    ? { background: e.color }
                    : { borderLeftColor: e.color, background: e.color + '22' }}
                  title={e.label}
                >
                  {e.kind === 'deadline' ? '🏁 ' : ''}{e.label}
                </div>
              ))}
              {list.length > MAX_CHIPS && <div className="chip more">+{list.length - MAX_CHIPS} more</div>}
            </div>
          );
        })}
      </div>

      <div className="cal-legend">
        <span><i className="dot deadline" /> Deadline</span>
        {hasSessions && <span><i className="dot session" /> Planned work session</span>}
      </div>
    </div>
  );
}
```
</details>

**In `client/src/pages/CalendarPage.jsx`:**

**1.** Add a state for the plan, under `selected`:

```jsx
  const [plan, setPlan] = useState({ source: '', days: {}, atRisk: [] });
```

**2.** Under the "Load tasks once" effect, ask for a plan **whenever the tasks change**:

```jsx
  // Ask the server for a plan whenever the tasks change
  useEffect(() => {
    api('/tasks/plan', { method: 'POST', body: { today: todayYMD() } })
      .then(setPlan)
      .catch(console.error);
  }, [tasks]);
```

**3.** Replace the whole `events` block with this version, which adds the sessions:

```jsx
  // ---- Turn tasks + plan into calendar events ----
  const taskById = useMemo(() => Object.fromEntries(tasks.map((t) => [t.id, t])), [tasks]);

  const events = useMemo(() => {
    const ev = {};
    for (const t of tasks) {
      (ev[t.deadline] ||= []).push({
        key: `d-${t.id}`, kind: 'deadline', label: t.title, color: t.color, done: t.done, task: t,
      });
    }
    for (const [day, sessions] of Object.entries(plan.days)) {
      // Merge several sessions of the same task on one day into one entry
      const perTask = {};
      for (const s of sessions) {
        perTask[s.taskId] ||= { ...s, hours: 0, count: 0 };
        perTask[s.taskId].hours += s.hours;
        perTask[s.taskId].count += 1;
      }
      for (const s of Object.values(perTask)) {
        const t = taskById[s.taskId];
        (ev[day] ||= []).push({
          key: `s-${day}-${s.taskId}`, kind: 'session', label: `${s.title} · ${s.hours}h`,
          hours: s.hours, count: s.count, color: t?.color || '#888', task: t,
        });
      }
    }
    return ev;
  }, [tasks, plan, taskById]);
```

**4.** In the day-details box, replace the lines from `{!dayEvents.length && ...}` down to the "Next step" hint with:

```jsx
          {!dayEvents.length && <p className="hint">Nothing planned. Free day 🎉</p>}
          {dayEvents.map((e) => (
            <div key={e.key} className="day-item">
              <i className="dot" style={{ background: e.color }} />
              {e.kind === 'deadline'
                ? <span><b>🏁 Deadline:</b> {e.label} {e.done && '✅'}</span>
                : <span>Work on <b>{e.task?.title}</b> for {e.hours}h
                    {e.count > 1 && <span className="hint"> ({e.count} sessions, take a break between)</span>}</span>}
            </div>
          ))}
```

**5.** Change the hint under the `<h2>`:

```jsx
        <p className="hint">Add tasks — your work gets spread out before every deadline.</p>
```

<details>
<summary>📄 Full <code>CalendarPage.jsx</code> so far</summary>

```jsx
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import MonthCalendar from '../components/MonthCalendar.jsx';
import { addDays, formatLong, fromYMD, relative, todayYMD } from '../utils/dates.js';

const emptyForm = () => ({ title: '', deadline: addDays(todayYMD(), 7), hours: 3, priority: 'medium' });

export default function CalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [month, setMonth] = useState(() => new Date()); // which month the calendar shows
  const [selected, setSelected] = useState(todayYMD()); // which day is clicked
  const [plan, setPlan] = useState({ source: '', days: {}, atRisk: [] });

  // Load tasks once
  useEffect(() => {
    api('/tasks').then(setTasks).catch(console.error);
  }, []);

  // Ask the server for a plan whenever the tasks change
  useEffect(() => {
    api('/tasks/plan', { method: 'POST', body: { today: todayYMD() } })
      .then(setPlan)
      .catch(console.error);
  }, [tasks]);

  // ---- Task actions ----
  const addTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const task = await api('/tasks', { method: 'POST', body: form });
    setTasks((prev) => [...prev, task]);
    setForm(emptyForm());
  };

  const updateTask = async (id, changes) => {
    const updated = await api(`/tasks/${id}`, { method: 'PATCH', body: changes });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const removeTask = async (id) => {
    await api(`/tasks/${id}`, { method: 'DELETE' });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const showDay = (ymd) => {
    setMonth(fromYMD(ymd));
    setSelected(ymd);
  };

  // ---- Turn tasks + plan into calendar events ----
  const taskById = useMemo(() => Object.fromEntries(tasks.map((t) => [t.id, t])), [tasks]);

  const events = useMemo(() => {
    const ev = {};
    for (const t of tasks) {
      (ev[t.deadline] ||= []).push({
        key: `d-${t.id}`, kind: 'deadline', label: t.title, color: t.color, done: t.done, task: t,
      });
    }
    for (const [day, sessions] of Object.entries(plan.days)) {
      // Merge several sessions of the same task on one day into one entry
      const perTask = {};
      for (const s of sessions) {
        perTask[s.taskId] ||= { ...s, hours: 0, count: 0 };
        perTask[s.taskId].hours += s.hours;
        perTask[s.taskId].count += 1;
      }
      for (const s of Object.values(perTask)) {
        const t = taskById[s.taskId];
        (ev[day] ||= []).push({
          key: `s-${day}-${s.taskId}`, kind: 'session', label: `${s.title} · ${s.hours}h`,
          hours: s.hours, count: s.count, color: t?.color || '#888', task: t,
        });
      }
    }
    return ev;
  }, [tasks, plan, taskById]);

  // ---- Stats ----
  const open = tasks.filter((t) => !t.done);
  const totalHours = open.reduce((s, t) => s + t.hours, 0);
  const nextDeadline = [...open].sort((a, b) => a.deadline.localeCompare(b.deadline))[0];
  const sortedTasks = [...tasks].sort(
    (a, b) => Number(a.done) - Number(b.done) || a.deadline.localeCompare(b.deadline)
  );
  const dayEvents = events[selected] || [];

  return (
    <div className="cal-page">
      {/* ---------- Left column ---------- */}
      <section className="cal-side">
        <h2>AI Calendar</h2>
        <p className="hint">Add tasks — your work gets spread out before every deadline.</p>

        <form className="card form" onSubmit={addTask}>
          <input
            placeholder="What do you need to do?"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <div className="row">
            <label>
              Deadline
              <input type="date" value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </label>
            <label>
              Hours
              <input type="number" min="0.5" step="0.5" value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })} />
            </label>
            <label>
              Priority
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
          <button type="submit">+ Add task</button>
        </form>

        <div className="stats">
          <div><b>{open.length}</b><span>open tasks</span></div>
          <div><b>{totalHours}h</b><span>work left</span></div>
          <div><b>{tasks.length - open.length}</b><span>done</span></div>
        </div>
        {nextDeadline && (
          <p className="hint">Next deadline: <b>{nextDeadline.title}</b> {relative(nextDeadline.deadline)}</p>
        )}

        <h3>Tasks</h3>
        {!tasks.length && <p className="hint">No tasks yet.</p>}
        <ul className="task-list">
          {sortedTasks.map((t) => (
            <li key={t.id} className={t.done ? 'done' : ''}>
              <input type="checkbox" checked={t.done} onChange={() => updateTask(t.id, { done: !t.done })} />
              <i className="dot" style={{ background: t.color }} />
              <div className="task-info" onClick={() => showDay(t.deadline)}>
                <div className="task-title">{t.title}</div>
                <div className="task-meta">
                  {t.hours}h · due {t.deadline} ({relative(t.deadline)})
                  <span className={`badge ${t.priority}`}>{t.priority}</span>
                </div>
              </div>
              <button className="small" onClick={() => removeTask(t.id)}>✕</button>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Right column ---------- */}
      <section className="cal-main">
        <MonthCalendar
          month={month}
          onMonthChange={setMonth}
          events={events}
          selected={selected}
          onSelect={setSelected}
        />

        <div className="card day-details">
          <h3>{formatLong(selected)}</h3>
          {!dayEvents.length && <p className="hint">Nothing planned. Free day 🎉</p>}
          {dayEvents.map((e) => (
            <div key={e.key} className="day-item">
              <i className="dot" style={{ background: e.color }} />
              {e.kind === 'deadline'
                ? <span><b>🏁 Deadline:</b> {e.label} {e.done && '✅'}</span>
                : <span>Work on <b>{e.task?.title}</b> for {e.hours}h
                    {e.count > 1 && <span className="hint"> ({e.count} sessions, take a break between)</span>}</span>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```
</details>

Now add two tasks: **Thesis chapter – 8h – due in 6 days**, and **Exam prep – 5h – due in 3 days**.

👀 **You see:** today says **13h**. Both tasks, all today. 😱 Panic mode works – and it's exactly what a procrastinator does the night before.

### 💡 What's new?

- `useEffect(..., [tasks])` – runs again **every time the tasks change**: add, delete, tick done → new plan
- `taskById` – a quick lookup *id → task*, to find each session's colour
- the server may plan several sessions of the same task on one day; we merge them into one chip (*"Thesis · 3h"*)

---

# Part J – A smarter algorithm, in three versions

An **algorithm** is a recipe: clear steps that always lead to a result. We improve our recipe twice. Keep the two tasks from I2 – you'll see the calendar change after every version.

## J1. ✍️ Version 2: max hours per day

Replace **everything** in **`server/src/planner.js`** with:

```js
// Planner for the AI Calendar.
// Idea: people who procrastinate need the work split into small sessions
// that start NOW and finish a day BEFORE the deadline (buffer day).

const SESSION_HOURS = 1.5; // max length of one work session
const toDateStr = (d) => d.toISOString().slice(0, 10);

// Version 2: max hours per day, fill the days from today on
export function ruleBasedPlan(tasks, { maxHoursPerDay = 4, today: todayStr } = {}) {
  const days = {};
  const atRisk = [];
  const used = {}; // hours already booked per day

  // "today" comes from the browser so the user's time zone is respected
  const today = new Date((todayStr || toDateStr(new Date())) + 'T00:00:00Z');

  // Earliest deadline first
  const sorted = [...tasks].sort((a, b) => a.deadline.localeCompare(b.deadline));

  for (const task of sorted) {
    let remaining = task.hours;
    const lastWorkDay = new Date(task.deadline + 'T00:00:00Z');
    lastWorkDay.setUTCDate(lastWorkDay.getUTCDate() - 1); // 1 buffer day

    for (let d = new Date(today); d <= lastWorkDay && remaining > 0; d.setUTCDate(d.getUTCDate() + 1)) {
      const key = toDateStr(d);
      // Book sessions on this day until the day is full or the task is done
      while (remaining > 0 && (used[key] || 0) < maxHoursPerDay) {
        const hours = Math.min(SESSION_HOURS, remaining, maxHoursPerDay - (used[key] || 0));
        (days[key] ||= []).push({ taskId: task.id, title: task.title, hours });
        used[key] = (used[key] || 0) + hours;
        remaining -= hours;
      }
    }

    if (remaining > 0) {
      atRisk.push({ taskId: task.id, title: task.title, missingHours: remaining });
    }
  }

  return { source: 'rule-based', days, atRisk };
}

export async function planTasks(tasks, options) {
  return ruleBasedPlan(tasks, options);
}
```

The server restarts and forgets the tasks – add the same two again.

👀 **You see:** max **4h** per day, filled from today on. Exam prep is done first (earliest deadline), then Thesis.

### 💡 How it works

1. **Sort:** earliest deadline first
2. For each task: go day by day, from today until the day **before** the deadline (one buffer day, in case something goes wrong)
3. On each day, book sessions of max **1.5h** until the day is full (**4h**) or the task is done
4. Hours left over at the end → the task is **at risk**

- `used` remembers how many hours each day already has
- `while (...)` repeats as long as the condition is true
- `Math.min(a, b, c)` – the smallest of the three: the session can't be longer than 1.5h, than what's left of the task, or than what's left of the day

🤔 Better than panic mode! But look: the Thesis is **finished days before** its deadline, and the first days are packed. Exhausting. Can we spread the work **evenly**?

---

## J2. ✍️ Version 3: spread evenly

Replace **everything** in **`server/src/planner.js`** with:

```js
// Planner for the AI Calendar.
// Idea: people who procrastinate need the work split into small sessions
// that start NOW and finish a day BEFORE the deadline (buffer day).

const SESSION_HOURS = 1.5; // max length of one work session
const toDateStr = (d) => d.toISOString().slice(0, 10);

/**
 * Rule-based planner (works without any API key).
 * Returns { source, days: { 'YYYY-MM-DD': [{ taskId, title, hours }] }, atRisk: [...] }
 */
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export function ruleBasedPlan(tasks, { maxHoursPerDay = 4, today: todayStr } = {}) {
  const days = {};
  const atRisk = [];
  const used = {}; // hours already booked per day

  // "today" comes from the browser so the user's time zone is respected
  const today = new Date((todayStr || toDateStr(new Date())) + 'T00:00:00Z');

  // Earliest deadline first; on the same deadline, higher priority first
  const sorted = [...tasks].sort(
    (a, b) =>
      a.deadline.localeCompare(b.deadline) ||
      (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1)
  );

  // Book up to `limit` hours of a task on one day, in sessions of max SESSION_HOURS
  const book = (task, key, limit) => {
    const total = Math.min(limit, maxHoursPerDay - (used[key] || 0));
    if (total <= 0) return 0;
    // Split into equal sessions, e.g. 2h -> 1h + 1h (not 1.5h + 0.5h)
    const count = Math.ceil(total / SESSION_HOURS);
    const base = Math.floor((total / count) * 4) / 4; // round to 15 min
    for (let i = 0; i < count; i++) {
      const hours = i === count - 1 ? total - base * (count - 1) : base; // last one takes the rest
      (days[key] ||= []).push({ taskId: task.id, title: task.title, hours });
    }
    used[key] = (used[key] || 0) + total;
    return total;
  };

  for (const task of sorted) {
    let remaining = task.hours;

    // All days we can work on it: today ... the day before the deadline (1 buffer day)
    const workDays = [];
    const lastWorkDay = new Date(task.deadline + 'T00:00:00Z');
    lastWorkDay.setUTCDate(lastWorkDay.getUTCDate() - 1);
    for (let d = new Date(today); d <= lastWorkDay; d.setUTCDate(d.getUTCDate() + 1)) {
      workDays.push(toDateStr(d));
    }

    // Pass 1: spread evenly -> a little bit every day (at least 1h, rounded up to 0.5h)
    const perDay = Math.max(1, Math.ceil((remaining / workDays.length) * 2) / 2);
    for (const key of workDays) {
      if (remaining <= 0) break;
      remaining -= book(task, key, Math.min(perDay, remaining));
    }

    // Pass 2: if some days were full, use any free time left (earliest first)
    for (const key of workDays) {
      if (remaining <= 0) break;
      remaining -= book(task, key, remaining);
    }

    if (remaining > 0) {
      atRisk.push({ taskId: task.id, title: task.title, missingHours: remaining });
    }
  }

  return { source: 'rule-based', days, atRisk };
}

export async function planTasks(tasks, options) {
  return ruleBasedPlan(tasks, options);
}
```

Add the two tasks again.

👀 **You see:** a little bit **every day** until each deadline. 🎉 That's a plan a procrastinator can actually follow.

### 💡 The new recipe

**Example:** today is Monday, a **6h** task is due **Saturday**, max 4h/day.

```
Work days:   Mon Tue Wed Thu Fri          (Saturday = deadline, no work)
Daily share: 6h ÷ 5 days = 1.2h  →  rounded up to 1.5h
Plan:        Mon 1.5h · Tue 1.5h · Wed 1.5h · Thu 1.5h  → done ✅  (Friday stays free as buffer)
```

- **Pass 1 – spread evenly:** `perDay` = hours ÷ work days, at least 1h, rounded **up** to a half hour (`Math.ceil(x * 2) / 2`: 1.2 → 1.5)
- **Pass 2 – fill gaps:** if some days were already full (other tasks), put the rest in any free time left
- **`book(...)`** – a helper that books hours on one day and splits them into **equal** sessions (2h → 1h + 1h, not 1.5h + 0.5h)
- **Priority:** same deadline → `high` first. In the sort, `||` means *"if the deadlines are equal (0), compare priorities instead"*

🧪 **Try:** add two tasks with the **same deadline**, one `high`, one `low` → the high one gets the earlier slots.

---

# Part K – Control the plan

## K1. ✍️ Daily limit and "at risk" warning

In **`client/src/pages/CalendarPage.jsx`**:

**1.** Add `useCallback` to the React import:

```jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
```

**2.** Add a state under `plan`:

```jsx
  const [maxHoursPerDay, setMaxHoursPerDay] = useState(4); // daily work limit
```

**3.** Replace the "Ask the server for a plan" effect with:

```jsx
  const fetchPlan = useCallback(
    (useAi = false) =>
      api('/tasks/plan', {
        method: 'POST',
        body: { maxHoursPerDay: Number(maxHoursPerDay), useAi, today: todayYMD() },
      }).then(setPlan),
    [maxHoursPerDay]
  );

  // Re-plan automatically whenever tasks or the daily limit change
  useEffect(() => {
    fetchPlan().catch(console.error);
  }, [tasks, fetchPlan]);
```

**4.** In the stats, replace the *done* box with an *at risk* box:

```jsx
          <div className={plan.atRisk.length ? 'bad' : ''}><b>{plan.atRisk.length}</b><span>at risk</span></div>
```

**5.** After the "Next deadline" line, add the warning and the daily-limit input:

```jsx
        {plan.atRisk.length > 0 && (
          <div className="warning">
            ⚠️ Not enough time for:
            <ul>
              {plan.atRisk.map((r) => <li key={r.taskId}>{r.title} — {r.missingHours}h missing</li>)}
            </ul>
            Raise the daily limit, lower the hours, or move the deadline.
          </div>
        )}

        <div className="card plan-row">
          <label>
            Max hours / day
            <input type="number" min="1" max="12" value={maxHoursPerDay}
              onChange={(e) => setMaxHoursPerDay(e.target.value)} />
          </label>
        </div>
```

👀 **Try it:**
1. Add a **12h** task due **tomorrow** → ⚠️ **at risk**, *"8h missing"*
2. Change **Max hours / day** to **12** → the warning disappears, the whole plan changes instantly
3. Tick a task as **done** → its sessions disappear

### 💡 `useCallback`

`fetchPlan` uses `maxHoursPerDay`. `useCallback` keeps the **same** function between redraws, and only makes a **new** one when `maxHoursPerDay` changes. Because `fetchPlan` is in the effect's dependency list, the effect runs again when the **tasks** change **or** the **daily limit** changes.

---

# Part L – Ask an AI 🤖

## 💡 What is an "AI model" here?

An **LLM** (Large Language Model, like ChatGPT) is a program you send text to, and it answers with text. Our server can:

1. write a **prompt**: our rules + the tasks + *"answer only with JSON in this format"*
2. send it to OpenAI's **API**
3. use the JSON answer as the plan

AI is powerful but **not reliable**: it can be slow, cost money, or answer nonsense. So we only use it when the user clicks a button, and if anything fails we **fall back** to our own planner.

## 🔐 Secrets: API keys and `.env`

An **API key** is a password for a paid service. Whoever has it can spend your money.
- ❌ never write it in the code, ❌ never commit it to git
- ✅ put it in **`server/.env`** – this file is listed in `.gitignore`, so git ignores it
- the server reads it with `process.env.OPENAI_API_KEY`

## L1. ✍️ The AI planner

Create **`server/.env.example`** – it documents which settings exist, without real values:

```bash
PORT=3001
# Optional: set this to let the calendar planner use a real LLM.
# Without it, a simple rule-based planner is used.
OPENAI_API_KEY=
```

Node doesn't read `.env` files by itself. In **`server/src/index.js`**, add this line **below the import lines**:

```js
// Load server/.env if it exists (secrets like OPENAI_API_KEY live there)
try { process.loadEnvFile(); } catch { /* no .env file – that's fine */ }
```

`try { … } catch { … }` – without a `.env` file, `loadEnvFile` throws an error; we simply ignore it.

In **`server/src/planner.js`**, replace the small `planTasks` function at the bottom with these two functions:

```js
/**
 * Optional: ask an LLM to build the plan. Falls back to rules on any problem.
 * Class exercise: improve the prompt, or add user preferences (e.g. "no work on Sundays").
 */
async function llmPlan(tasks, { maxHoursPerDay, today: todayStr }) {
  const today = todayStr || toDateStr(new Date());
  const prompt = `Today is ${today}. Plan these tasks for a person who procrastinates.
Rules: start today, sessions of max ${SESSION_HOURS}h, max ${maxHoursPerDay}h per day,
finish each task at least one day before its deadline, prefer high-priority tasks.
Tasks: ${JSON.stringify(tasks.map(({ id, title, deadline, hours, priority }) => ({ id, title, deadline, hours, priority })))}
Reply ONLY with JSON: {"days": {"YYYY-MM-DD": [{"taskId": number, "title": string, "hours": number}]}, "atRisk": [{"taskId": number, "title": string, "missingHours": number}]}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`LLM error ${res.status}`);
  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  return { source: 'ai', days: parsed.days || {}, atRisk: parsed.atRisk || [] };
}

// useAi: only call the LLM when the user explicitly asks (it's slower and costs money)
export async function planTasks(tasks, options) {
  if (options.useAi && process.env.OPENAI_API_KEY) {
    try {
      return await llmPlan(tasks, options);
    } catch (err) {
      console.warn('LLM planning failed, using rule-based planner:', err.message);
    }
  }
  return ruleBasedPlan(tasks, options);
}
```

### 💡 What's happening?

- the **prompt** is plain text: the same rules as our algorithm, in English
- we ask for **JSON in exactly our format** – so the frontend can't tell who made the plan
- `fetch` works on the server too: here **our server** sends a request to OpenAI
- `Authorization: Bearer …` sends the secret key
- `planTasks` decides: AI only if the user asked (`useAi`) **and** a key exists. If the AI fails → `catch` → our rule-based planner

<details>
<summary>✅ <b>Checkpoint:</b> <code>server/src/planner.js</code> (final version)</summary>

```js
// Planner for the AI Calendar.
// Idea: people who procrastinate need the work split into small sessions
// that start NOW and finish a day BEFORE the deadline (buffer day).

const SESSION_HOURS = 1.5; // max length of one work session
const toDateStr = (d) => d.toISOString().slice(0, 10);

/**
 * Rule-based planner (works without any API key).
 * Returns { source, days: { 'YYYY-MM-DD': [{ taskId, title, hours }] }, atRisk: [...] }
 */
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export function ruleBasedPlan(tasks, { maxHoursPerDay = 4, today: todayStr } = {}) {
  const days = {};
  const atRisk = [];
  const used = {}; // hours already booked per day

  // "today" comes from the browser so the user's time zone is respected
  const today = new Date((todayStr || toDateStr(new Date())) + 'T00:00:00Z');

  // Earliest deadline first; on the same deadline, higher priority first
  const sorted = [...tasks].sort(
    (a, b) =>
      a.deadline.localeCompare(b.deadline) ||
      (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1)
  );

  // Book up to `limit` hours of a task on one day, in sessions of max SESSION_HOURS
  const book = (task, key, limit) => {
    const total = Math.min(limit, maxHoursPerDay - (used[key] || 0));
    if (total <= 0) return 0;
    // Split into equal sessions, e.g. 2h -> 1h + 1h (not 1.5h + 0.5h)
    const count = Math.ceil(total / SESSION_HOURS);
    const base = Math.floor((total / count) * 4) / 4; // round to 15 min
    for (let i = 0; i < count; i++) {
      const hours = i === count - 1 ? total - base * (count - 1) : base; // last one takes the rest
      (days[key] ||= []).push({ taskId: task.id, title: task.title, hours });
    }
    used[key] = (used[key] || 0) + total;
    return total;
  };

  for (const task of sorted) {
    let remaining = task.hours;

    // All days we can work on it: today ... the day before the deadline (1 buffer day)
    const workDays = [];
    const lastWorkDay = new Date(task.deadline + 'T00:00:00Z');
    lastWorkDay.setUTCDate(lastWorkDay.getUTCDate() - 1);
    for (let d = new Date(today); d <= lastWorkDay; d.setUTCDate(d.getUTCDate() + 1)) {
      workDays.push(toDateStr(d));
    }

    // Pass 1: spread evenly -> a little bit every day (at least 1h, rounded up to 0.5h)
    const perDay = Math.max(1, Math.ceil((remaining / workDays.length) * 2) / 2);
    for (const key of workDays) {
      if (remaining <= 0) break;
      remaining -= book(task, key, Math.min(perDay, remaining));
    }

    // Pass 2: if some days were full, use any free time left (earliest first)
    for (const key of workDays) {
      if (remaining <= 0) break;
      remaining -= book(task, key, remaining);
    }

    if (remaining > 0) {
      atRisk.push({ taskId: task.id, title: task.title, missingHours: remaining });
    }
  }

  return { source: 'rule-based', days, atRisk };
}

/**
 * Optional: ask an LLM to build the plan. Falls back to rules on any problem.
 * Class exercise: improve the prompt, or add user preferences (e.g. "no work on Sundays").
 */
async function llmPlan(tasks, { maxHoursPerDay, today: todayStr }) {
  const today = todayStr || toDateStr(new Date());
  const prompt = `Today is ${today}. Plan these tasks for a person who procrastinates.
Rules: start today, sessions of max ${SESSION_HOURS}h, max ${maxHoursPerDay}h per day,
finish each task at least one day before its deadline, prefer high-priority tasks.
Tasks: ${JSON.stringify(tasks.map(({ id, title, deadline, hours, priority }) => ({ id, title, deadline, hours, priority })))}
Reply ONLY with JSON: {"days": {"YYYY-MM-DD": [{"taskId": number, "title": string, "hours": number}]}, "atRisk": [{"taskId": number, "title": string, "missingHours": number}]}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`LLM error ${res.status}`);
  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  return { source: 'ai', days: parsed.days || {}, atRisk: parsed.atRisk || [] };
}

// useAi: only call the LLM when the user explicitly asks (it's slower and costs money)
export async function planTasks(tasks, options) {
  if (options.useAi && process.env.OPENAI_API_KEY) {
    try {
      return await llmPlan(tasks, options);
    } catch (err) {
      console.warn('LLM planning failed, using rule-based planner:', err.message);
    }
  }
  return ruleBasedPlan(tasks, options);
}
```
</details>

## L2. ✍️ The AI button

In **`client/src/pages/CalendarPage.jsx`**:

**1.** Add a state:

```jsx
  const [aiLoading, setAiLoading] = useState(false);
```

**2.** Under the re-plan effect, add:

```jsx
  const planWithAi = async () => {
    setAiLoading(true);
    try { await fetchPlan(true); } finally { setAiLoading(false); }
  };
```

**3.** In the `plan-row` card, after the `</label>`, add the button – and below the card, show who made the plan:

```jsx
          <button onClick={planWithAi} disabled={!open.length || aiLoading}>
            {aiLoading ? 'Thinking…' : '✨ Re-plan with AI'}
          </button>
```

```jsx
        {plan.source && <p className="hint">Current plan: {plan.source}</p>}
```

👀 **You see:** a **✨ Re-plan with AI** button and *"Current plan: rule-based"*.

- `finally` always runs – success or error – so the button never stays stuck on *"Thinking…"*
- `disabled={...}` – greyed out when there's nothing to plan, or while waiting

**Using a real AI** (needs an OpenAI account with credit):

```bash
cp server/.env.example server/.env    # then put your key in server/.env
```

Restart the app (**Control + C**, then `npm run dev`), click **✨ Re-plan with AI** → *"Current plan: ai"*. Compare the AI's plan with ours! Without a key, the button safely uses the rule-based planner.

<details>
<summary>✅ <b>Checkpoint:</b> your <code>CalendarPage.jsx</code> should now look like this</summary>

```jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import MonthCalendar from '../components/MonthCalendar.jsx';
import { addDays, formatLong, fromYMD, relative, todayYMD } from '../utils/dates.js';

const emptyForm = () => ({ title: '', deadline: addDays(todayYMD(), 7), hours: 3, priority: 'medium' });

export default function CalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [month, setMonth] = useState(() => new Date()); // which month the calendar shows
  const [selected, setSelected] = useState(todayYMD()); // which day is clicked
  const [plan, setPlan] = useState({ source: '', days: {}, atRisk: [] });
  const [maxHoursPerDay, setMaxHoursPerDay] = useState(4); // daily work limit
  const [aiLoading, setAiLoading] = useState(false);

  // Load tasks once
  useEffect(() => {
    api('/tasks').then(setTasks).catch(console.error);
  }, []);

  const fetchPlan = useCallback(
    (useAi = false) =>
      api('/tasks/plan', {
        method: 'POST',
        body: { maxHoursPerDay: Number(maxHoursPerDay), useAi, today: todayYMD() },
      }).then(setPlan),
    [maxHoursPerDay]
  );

  // Re-plan automatically whenever tasks or the daily limit change
  useEffect(() => {
    fetchPlan().catch(console.error);
  }, [tasks, fetchPlan]);

  const planWithAi = async () => {
    setAiLoading(true);
    try { await fetchPlan(true); } finally { setAiLoading(false); }
  };

  // ---- Task actions ----
  const addTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const task = await api('/tasks', { method: 'POST', body: form });
    setTasks((prev) => [...prev, task]);
    setForm(emptyForm());
  };

  const updateTask = async (id, changes) => {
    const updated = await api(`/tasks/${id}`, { method: 'PATCH', body: changes });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const removeTask = async (id) => {
    await api(`/tasks/${id}`, { method: 'DELETE' });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const showDay = (ymd) => {
    setMonth(fromYMD(ymd));
    setSelected(ymd);
  };

  // ---- Turn tasks + plan into calendar events ----
  const taskById = useMemo(() => Object.fromEntries(tasks.map((t) => [t.id, t])), [tasks]);

  const events = useMemo(() => {
    const ev = {};
    for (const t of tasks) {
      (ev[t.deadline] ||= []).push({
        key: `d-${t.id}`, kind: 'deadline', label: t.title, color: t.color, done: t.done, task: t,
      });
    }
    for (const [day, sessions] of Object.entries(plan.days)) {
      // Merge several sessions of the same task on one day into one entry
      const perTask = {};
      for (const s of sessions) {
        perTask[s.taskId] ||= { ...s, hours: 0, count: 0 };
        perTask[s.taskId].hours += s.hours;
        perTask[s.taskId].count += 1;
      }
      for (const s of Object.values(perTask)) {
        const t = taskById[s.taskId];
        (ev[day] ||= []).push({
          key: `s-${day}-${s.taskId}`, kind: 'session', label: `${s.title} · ${s.hours}h`,
          hours: s.hours, count: s.count, color: t?.color || '#888', task: t,
        });
      }
    }
    return ev;
  }, [tasks, plan, taskById]);

  // ---- Stats ----
  const open = tasks.filter((t) => !t.done);
  const totalHours = open.reduce((s, t) => s + t.hours, 0);
  const nextDeadline = [...open].sort((a, b) => a.deadline.localeCompare(b.deadline))[0];
  const sortedTasks = [...tasks].sort(
    (a, b) => Number(a.done) - Number(b.done) || a.deadline.localeCompare(b.deadline)
  );
  const dayEvents = events[selected] || [];

  return (
    <div className="cal-page">
      {/* ---------- Left column ---------- */}
      <section className="cal-side">
        <h2>AI Calendar</h2>
        <p className="hint">Add tasks — your work gets spread out before every deadline.</p>

        <form className="card form" onSubmit={addTask}>
          <input
            placeholder="What do you need to do?"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <div className="row">
            <label>
              Deadline
              <input type="date" value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </label>
            <label>
              Hours
              <input type="number" min="0.5" step="0.5" value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })} />
            </label>
            <label>
              Priority
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
          <button type="submit">+ Add task</button>
        </form>

        <div className="stats">
          <div><b>{open.length}</b><span>open tasks</span></div>
          <div><b>{totalHours}h</b><span>work left</span></div>
          <div className={plan.atRisk.length ? 'bad' : ''}><b>{plan.atRisk.length}</b><span>at risk</span></div>
        </div>
        {nextDeadline && (
          <p className="hint">Next deadline: <b>{nextDeadline.title}</b> {relative(nextDeadline.deadline)}</p>
        )}

        {plan.atRisk.length > 0 && (
          <div className="warning">
            ⚠️ Not enough time for:
            <ul>
              {plan.atRisk.map((r) => <li key={r.taskId}>{r.title} — {r.missingHours}h missing</li>)}
            </ul>
            Raise the daily limit, lower the hours, or move the deadline.
          </div>
        )}

        <div className="card plan-row">
          <label>
            Max hours / day
            <input type="number" min="1" max="12" value={maxHoursPerDay}
              onChange={(e) => setMaxHoursPerDay(e.target.value)} />
          </label>
          <button onClick={planWithAi} disabled={!open.length || aiLoading}>
            {aiLoading ? 'Thinking…' : '✨ Re-plan with AI'}
          </button>
        </div>
        {plan.source && <p className="hint">Current plan: {plan.source}</p>}

        <h3>Tasks</h3>
        {!tasks.length && <p className="hint">No tasks yet.</p>}
        <ul className="task-list">
          {sortedTasks.map((t) => (
            <li key={t.id} className={t.done ? 'done' : ''}>
              <input type="checkbox" checked={t.done} onChange={() => updateTask(t.id, { done: !t.done })} />
              <i className="dot" style={{ background: t.color }} />
              <div className="task-info" onClick={() => showDay(t.deadline)}>
                <div className="task-title">{t.title}</div>
                <div className="task-meta">
                  {t.hours}h · due {t.deadline} ({relative(t.deadline)})
                  <span className={`badge ${t.priority}`}>{t.priority}</span>
                </div>
              </div>
              <button className="small" onClick={() => removeTask(t.id)}>✕</button>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Right column ---------- */}
      <section className="cal-main">
        <MonthCalendar
          month={month}
          onMonthChange={setMonth}
          events={events}
          selected={selected}
          onSelect={setSelected}
        />

        <div className="card day-details">
          <h3>{formatLong(selected)}</h3>
          {!dayEvents.length && <p className="hint">Nothing planned. Free day 🎉</p>}
          {dayEvents.map((e) => (
            <div key={e.key} className="day-item">
              <i className="dot" style={{ background: e.color }} />
              {e.kind === 'deadline'
                ? <span><b>🏁 Deadline:</b> {e.label} {e.done && '✅'}</span>
                : <span>Work on <b>{e.task?.title}</b> for {e.hours}h
                    {e.count > 1 && <span className="hint"> ({e.count} sessions, take a break between)</span>}</span>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```
</details>

---

# 🎉 You built it!

A full-stack app: React frontend, Express backend, your own algorithm and an AI integration.

## 💪 Bonus exercises

**A.** No work on Sundays.

<details><summary>💡 Solution</summary>

In `planner.js`, where `workDays` is built, skip Sundays (`getUTCDay()` → 0 = Sunday):

```js
for (let d = new Date(today); d <= lastWorkDay; d.setUTCDate(d.getUTCDate() + 1)) {
  if (d.getUTCDay() === 0) continue;   // skip Sunday
  workDays.push(toDateStr(d));
}
```
</details>

**B.** Shorter sessions: max 45 minutes. *(Hint: one number at the top of `planner.js`.)*

**C.** Two buffer days instead of one. *(Hint: `getUTCDate() - 1`.)*

**D.** Improve the AI prompt: add *"never plan more than 2 different tasks on one day"* and compare.

## 🚀 Ideas for your own project

- 💾 a real **database** (PostgreSQL or MongoDB), so data survives a server restart
- 🔐 user accounts, so everyone has their own tasks and places
- 🔎 map: address search, routes between places, satellite view
- 🗓️ calendar: week view with time slots, drag sessions to other days, reminders
- 🌍 put it online: frontend on Vercel or Netlify, backend on Render or Railway

## 📖 Words you learned

| Word | Meaning |
|---|---|
| **Business logic** | the rules of your app – lives on the server |
| **Algorithm** | a step-by-step recipe that always gives a result |
| **LLM / AI model** | a program that answers text with text |
| **Prompt** | the instructions we send to the AI |
| **API key** | a password for a paid service – keep it secret |
| **`.env` / environment variable** | settings and secrets kept outside the code |
| **Fallback** | plan B when something fails |
| **`try / catch / finally`** | handle errors without crashing; `finally` always runs |
| **`useCallback`** | keep the same function until its inputs change |
