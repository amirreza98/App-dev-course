# App Development Course – Build two real apps

We build two apps **step by step, with our own hands**: a 🗺️ **3D Map** and a 📅 **AI Calendar** (for people who leave everything to the last minute).
**Tools:** React + Vite · Node.js + Express · MapLibre

> 📋 **Start here: [Project plan on Miro](https://miro.com/app/board/uXjVHeLSHBw=/?share_link_id=439689196857)**. Before we write any code, we walk through the full software development life cycle of this project: Planning → Requirements → Design → Development → Testing → Deployment & Maintenance.

| Step (open its tutorial) | Branch | Time |
|---|---|---|
| [0 · Your first React app](https://github.com/amirreza98/App-dev-course/tree/main#readme) | `main` | ~30 min |
| [1 · React basics](https://github.com/amirreza98/App-dev-course/tree/step-1-react#readme) | `step-1-react` | ~60 min |
| [2 · Backend](https://github.com/amirreza98/App-dev-course/tree/step-2-backend#readme) | `step-2-backend` | ~60 min |
| [3 · Calendar](https://github.com/amirreza98/App-dev-course/tree/step-3-calendar#readme) **📍 you are here** | `step-3-calendar` | ~50 min |
| [4 · Planner + AI](https://github.com/amirreza98/App-dev-course/tree/step-4-planner#readme) | `step-4-planner` | ~50 min |

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

# Lesson 3 – Calendar: a month view with all deadlines

| | |
|---|---|
| ⏱️ Time | ~50 min |
| 🏁 Start from | your code from Lesson 2 (or `git checkout -f step-2-backend && npm install`) |
| ✅ Finished result | branch `step-3-calendar` |
| 🎯 You will | build a month calendar from scratch, show every deadline on it, and mark tasks as done |

> 🆘 **Stuck or behind?** Run `git checkout -f step-3-calendar && npm install` to get the finished code of this lesson.

---

## G1. ✍️ Server: priority, colour and "done"

Open **`server/src/routes/tasks.js`**.

**1.** Under `const router = Router();`, add two lists:

```js
const COLORS = ['#4361ee', '#e63946', '#2a9d8f', '#f4a261', '#9b5de5', '#06aed5', '#e76f51', '#588157'];
const PRIORITIES = ['low', 'medium', 'high'];
```

**2.** Replace the `POST` route with:

```js
// POST /api/tasks -> create a task. Body: { title, deadline, hours, priority }
router.post('/', (req, res) => {
  const { title, deadline, hours, priority = 'medium' } = req.body;
  if (!title || !deadline || !hours) {
    return res.status(400).json({ error: 'title, deadline and hours are required' });
  }
  const id = nextId++;
  const task = {
    id,
    title,
    deadline,
    hours: Number(hours),
    priority: PRIORITIES.includes(priority) ? priority : 'medium',
    color: COLORS[(id - 1) % COLORS.length],
    done: false,
  };
  tasks.push(task);
  res.status(201).json(task);
});
```

**3.** Add a new route **above** the `DELETE` route:

```js
// PATCH /api/tasks/:id -> change some fields, e.g. { done: true } or { priority: 'high' }
router.patch('/:id', (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const { title, deadline, hours, priority, done } = req.body;
  if (title !== undefined) task.title = title;
  if (deadline !== undefined) task.deadline = deadline;
  if (hours !== undefined) task.hours = Number(hours);
  if (PRIORITIES.includes(priority)) task.priority = priority;
  if (done !== undefined) task.done = Boolean(done);
  res.json(task);
});
```

The server restarted by itself (and forgot all tasks – memory!). Add a task in the app, then open **http://localhost:3001/api/tasks**.
👀 **You see:** the task now also has `"priority"`, `"color"` and `"done": false`.

### 💡 What's new?

- `priority = 'medium'` – a **default value**: if the frontend sends no priority, use `'medium'`
- `COLORS[(id - 1) % COLORS.length]` – each task gets the next colour. `%` (modulo) is the remainder of a division, so after colour 8 we start again at 1
- **`PATCH`** = *change some fields* of something that exists. We'll use it to tick a task as done: `PATCH /api/tasks/3` with `{ "done": true }`
- `.find()` returns the first task with that id (or `undefined` → `404 Not Found`)

---

## G2. ✍️ Date helpers

Dates are tricky. We keep all date code in one file. Create the folder **`client/src/utils`** and the file **`client/src/utils/dates.js`**:

```js
// Date helpers that work with 'YYYY-MM-DD' strings in the user's LOCAL time zone.

const pad = (n) => String(n).padStart(2, '0');

export const toYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromYMD = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const todayYMD = () => toYMD(new Date());

export const addDays = (ymd, n) => {
  const d = fromYMD(ymd);
  d.setDate(d.getDate() + n);
  return toYMD(d);
};

export const daysBetween = (fromYmd, toYmd) =>
  Math.round((fromYMD(toYmd) - fromYMD(fromYmd)) / 86_400_000);

// All cells for a month grid, weeks starting on Monday (6 rows x 7 days)
export function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Monday = 0
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return { ymd: toYMD(d), day: d.getDate(), inMonth: d.getMonth() === month };
  });
}

export const formatLong = (ymd) =>
  fromYMD(ymd).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

export const relative = (ymd) => {
  const n = daysBetween(todayYMD(), ymd);
  if (n < 0) return `${-n}d overdue`;
  if (n === 0) return 'today';
  if (n === 1) return 'tomorrow';
  return `in ${n} days`;
};
```

Nothing changes on screen – these are tools for the next blocks. The important ones:

| Function | Example | Result |
|---|---|---|
| `todayYMD()` | | `'2026-10-26'` |
| `addDays(ymd, n)` | `addDays('2026-10-30', 3)` | `'2026-11-02'` |
| `relative(ymd)` | a date 3 days from now | `'in 3 days'` |
| `formatLong(ymd)` | `'2026-10-26'` | `'Monday, October 26'` |
| `monthGrid(year, month)` | October 2026 | the 42 boxes of the calendar (next block) |

💡 We store dates as text `'YYYY-MM-DD'`: easy to compare and sort (`'2026-10-29' < '2026-11-01'` is `true`).
⚠️ JavaScript quirk: `getMonth()` counts from **0** (January = 0). That's why you see `+ 1` and `- 1`.

### 💡 How `monthGrid` works

A month calendar always shows **6 weeks × 7 days = 42 boxes**, starting on a Monday:

```
October 2026 – the 1st is a Thursday → go back 3 days → start on Mon 28 Sept
Mon Tue Wed Thu Fri Sat Sun
 28  29  30   1   2   3   4
  5   6   7   8 …
```

For each of the 42 days it returns `{ ymd: '2026-09-28', day: 28, inMonth: false }`. `inMonth` tells us whether to show it grey.

---

## G3. ✍️ A calendar component

The calendar is a big piece, so it gets **its own component in its own file**. Create the folder **`client/src/components`** and the file **`client/src/components/MonthCalendar.jsx`**:

```jsx
import { monthGrid } from '../utils/dates.js';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MonthCalendar({ month }) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const cells = monthGrid(year, m);

  const title = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="cal">
      <div className="cal-header">
        <h3>{title}</h3>
      </div>

      <div className="cal-grid">
        {WEEKDAYS.map((w) => <div key={w} className="cal-weekday">{w}</div>)}

        {cells.map(({ ymd, day, inMonth }) => (
          <div key={ymd} className={inMonth ? 'cal-cell' : 'cal-cell muted'}>
            <div className="cal-day">
              <span>{day}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

Now use it on the calendar page, in a two-column layout. Open **`client/src/pages/CalendarPage.jsx`**:

**1.** Import it at the top:

```jsx
import MonthCalendar from '../components/MonthCalendar.jsx';
```

**2.** Change the outer `<div className="simple-page">` to `<div className="cal-page">`, and wrap everything that's inside it in a `<section className="cal-side">`. Then add a second section with the calendar. The JSX should have this shape:

```jsx
  return (
    <div className="cal-page">
      {/* ---------- Left column ---------- */}
      <section className="cal-side">
        {/* ...everything that was there before: h2, hint, form, h3, list... */}
      </section>

      {/* ---------- Right column ---------- */}
      <section className="cal-main">
        <MonthCalendar month={new Date()} />
      </section>
    </div>
  );
```

👀 **You see:** tasks on the left, a calendar of the current month on the right!

### 💡 Props: giving data to a component

```jsx
<MonthCalendar month={new Date()} />
```

```jsx
export default function MonthCalendar({ month }) {
```

`month={...}` is a **prop** (property). It works like an argument to a function: the page gives data **down** to the calendar. The calendar uses it to know which month to draw.

🧱 Components are LEGO bricks – props are how they connect.

---

## G4. ✍️ Switch months

The page should **remember** which month is shown – that's state. And the calendar needs a way to **tell** the page *"go to the next month"*.

**In `CalendarPage.jsx`:** add a state under the other `useState` lines, and pass two props:

```jsx
  const [month, setMonth] = useState(() => new Date()); // which month the calendar shows
```

```jsx
        <MonthCalendar month={month} onMonthChange={setMonth} />
```

**In `MonthCalendar.jsx`:**

**1.** Accept the new prop:

```jsx
export default function MonthCalendar({ month, onMonthChange }) {
```

**2.** Above `const title = ...`, add:

```jsx
  const shift = (n) => onMonthChange(new Date(year, m + n, 1));
```

**3.** Replace the `cal-header` div with:

```jsx
      <div className="cal-header">
        <button onClick={() => shift(-1)}>‹</button>
        <h3>{title}</h3>
        <button onClick={() => shift(1)}>›</button>
        <button className="ghost" onClick={() => onMonthChange(new Date())}>
          Today
        </button>
      </div>
```

👀 **You see:** **‹** and **›** switch months, **Today** jumps back.

### 💡 A function as a prop

`onMonthChange={setMonth}` – we pass a **function** down. When you click **›**:

```
calendar: shift(1) → onMonthChange(November) → page: setMonth(November) → page redraws → calendar gets month = November
```

The state lives in the **page**, the calendar just shows it and reports clicks. This is called **lifting state up** – the page will need `month` again soon.

`new Date(year, m + 1, 1)` – JavaScript is smart: month 12 automatically becomes January of the next year.

---

## G5. ✍️ Deadlines on the calendar

The calendar doesn't want a *list of tasks*. It wants to know *"what happens on each day?"*:

```js
// tasks (what we store)                       events (what the calendar needs)
[{ title: 'Exam', deadline: '2026-10-29' }]  →  { '2026-10-29': [{ label: 'Exam', ... }] }
```

**In `CalendarPage.jsx`:**

**1.** Add `useMemo` to the React import:

```jsx
import { useEffect, useMemo, useState } from 'react';
```

**2.** Just **before** `return (`, add:

```jsx
  // Turn tasks into calendar events: { 'YYYY-MM-DD': [event, ...] }
  const events = useMemo(() => {
    const ev = {};
    for (const t of tasks) {
      (ev[t.deadline] ||= []).push({
        key: `d-${t.id}`, kind: 'deadline', label: t.title, color: t.color, done: t.done, task: t,
      });
    }
    return ev;
  }, [tasks]);
```

**3.** Pass it to the calendar:

```jsx
        <MonthCalendar month={month} onMonthChange={setMonth} events={events} />
```

**In `MonthCalendar.jsx`:**

**1.** Under `WEEKDAYS`, add `const MAX_CHIPS = 3;` and accept the prop: `({ month, onMonthChange, events })`

**2.** Replace the `cells.map(...)` part with:

```jsx
        {cells.map(({ ymd, day, inMonth }) => {
          const list = events[ymd] || [];

          return (
            <div key={ymd} className={inMonth ? 'cal-cell' : 'cal-cell muted'}>
              <div className="cal-day">
                <span>{day}</span>
              </div>
              {list.slice(0, MAX_CHIPS).map((e) => (
                <div
                  key={e.key}
                  className={`chip deadline ${e.done ? 'done' : ''}`}
                  style={{ background: e.color }}
                  title={e.label}
                >
                  🏁 {e.label}
                </div>
              ))}
              {list.length > MAX_CHIPS && <div className="chip more">+{list.length - MAX_CHIPS} more</div>}
            </div>
          );
        })}
```

👀 **You see:** add a task → a coloured **🏁 chip** appears on its deadline day! Try a deadline next month, then click **›**.

### 💡 What's new?

- **Derived data:** `events` is *calculated* from `tasks`, not stored separately. One source of truth
- **`useMemo`** remembers the result and only recalculates when `tasks` changes
- `(ev[t.deadline] ||= [])` – *"if this day has no list yet, create an empty one"*, then `.push` into it
- `events[ymd] || []` – the events of this day, or an empty list
- `style={{ background: e.color }}` – a style from JavaScript. Two `{{ }}`: one for "JavaScript here", one for the object
- `list.slice(0, 3)` – show max 3 chips, the rest becomes *"+2 more"*

<details>
<summary>📄 <code>MonthCalendar.jsx</code> so far</summary>

```jsx
import { monthGrid } from '../utils/dates.js';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_CHIPS = 3;

export default function MonthCalendar({ month, onMonthChange, events }) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const cells = monthGrid(year, m);

  const shift = (n) => onMonthChange(new Date(year, m + n, 1));
  const title = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="cal">
      <div className="cal-header">
        <button onClick={() => shift(-1)}>‹</button>
        <h3>{title}</h3>
        <button onClick={() => shift(1)}>›</button>
        <button className="ghost" onClick={() => onMonthChange(new Date())}>
          Today
        </button>
      </div>

      <div className="cal-grid">
        {WEEKDAYS.map((w) => <div key={w} className="cal-weekday">{w}</div>)}

        {cells.map(({ ymd, day, inMonth }) => {
          const list = events[ymd] || [];

          return (
            <div key={ymd} className={inMonth ? 'cal-cell' : 'cal-cell muted'}>
              <div className="cal-day">
                <span>{day}</span>
              </div>
              {list.slice(0, MAX_CHIPS).map((e) => (
                <div
                  key={e.key}
                  className={`chip deadline ${e.done ? 'done' : ''}`}
                  style={{ background: e.color }}
                  title={e.label}
                >
                  🏁 {e.label}
                </div>
              ))}
              {list.length > MAX_CHIPS && <div className="chip more">+{list.length - MAX_CHIPS} more</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```
</details>

---

## G6. ✍️ Click a day, highlight today

**In `CalendarPage.jsx`:**

**1.** Import two date helpers:

```jsx
import { formatLong, todayYMD } from '../utils/dates.js';
```

**2.** Add a state for the clicked day (under `month`):

```jsx
  const [selected, setSelected] = useState(todayYMD()); // which day is clicked
```

**3.** Before `return (`, after the `events` block:

```jsx
  const dayEvents = events[selected] || [];
```

**4.** Replace the `<MonthCalendar ... />` line with the calendar **plus** a details box:

```jsx
        <MonthCalendar
          month={month}
          onMonthChange={setMonth}
          events={events}
          selected={selected}
          onSelect={setSelected}
        />

        <div className="card day-details">
          <h3>{formatLong(selected)}</h3>
          {!dayEvents.length && <p className="hint">No deadlines this day.</p>}
          {dayEvents.map((e) => (
            <div key={e.key} className="day-item">
              <i className="dot" style={{ background: e.color }} />
              <span><b>🏁 Deadline:</b> {e.label} {e.done && '✅'}</span>
            </div>
          ))}
        </div>
```

**In `MonthCalendar.jsx`:** replace the **whole file** with the final version:

```jsx
import { monthGrid, todayYMD } from '../utils/dates.js';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_CHIPS = 3;

/**
 * Month view.
 * events: { 'YYYY-MM-DD': [{ key, label, color, done }] }
 */
export default function MonthCalendar({ month, onMonthChange, events, selected, onSelect }) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const today = todayYMD();
  const cells = monthGrid(year, m);

  const shift = (n) => onMonthChange(new Date(year, m + n, 1));
  const title = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

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
              </div>
              {list.slice(0, MAX_CHIPS).map((e) => (
                <div
                  key={e.key}
                  className={`chip deadline ${e.done ? 'done' : ''}`}
                  style={{ background: e.color }}
                  title={e.label}
                >
                  🏁 {e.label}
                </div>
              ))}
              {list.length > MAX_CHIPS && <div className="chip more">+{list.length - MAX_CHIPS} more</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

What changed in the calendar:
- new props `selected` and `onSelect`
- every day box has `onClick={() => onSelect(ymd)}` → tells the page which day was clicked
- **Today** also selects today
- the CSS classes are built from a list:

```jsx
const classes = [
  'cal-cell',
  !inMonth && 'muted',          // grey if not in this month
  ymd < today && 'past',        // faded if in the past
  ymd === today && 'today',     // dark border
  ymd === selected && 'selected', // light blue
].filter(Boolean).join(' ');    // e.g. "cal-cell today selected"
```

Each line is a class name **or** `false`. `.filter(Boolean)` removes the `false`s, `.join(' ')` glues the rest together.

👀 **You see:** today has a dark border. Click a day → it turns light blue, and the box below shows its date and deadlines.

💡 `selected` lives in the **page**, because **two** things need it: the calendar (highlight) and the details box. *Put state in the closest parent that needs it.*

---

## G7. ✍️ Priority, done checkbox and stats

The page is growing. Replace the **whole** **`client/src/pages/CalendarPage.jsx`** with:

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

  // Load tasks once
  useEffect(() => {
    api('/tasks').then(setTasks).catch(console.error);
  }, []);

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

  // ---- Turn tasks into calendar events: { 'YYYY-MM-DD': [event, ...] } ----
  const events = useMemo(() => {
    const ev = {};
    for (const t of tasks) {
      (ev[t.deadline] ||= []).push({
        key: `d-${t.id}`, kind: 'deadline', label: t.title, color: t.color, done: t.done, task: t,
      });
    }
    return ev;
  }, [tasks]);

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
        <p className="hint">Step 3: every deadline appears on the calendar.</p>

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
          {!dayEvents.length && <p className="hint">No deadlines this day.</p>}
          {dayEvents.map((e) => (
            <div key={e.key} className="day-item">
              <i className="dot" style={{ background: e.color }} />
              <span><b>🏁 Deadline:</b> {e.label} {e.done && '✅'}</span>
            </div>
          ))}
          <p className="hint">Next step: plan <i>when</i> to work on each task, so it's not all left for the last day.</p>
        </div>
      </section>
    </div>
  );
}
```

👀 **You see:**
- a **Priority** dropdown; each task shows a coloured dot and a priority badge
- a **checkbox**: tick it → the task is crossed out in the list **and** on the calendar
- **stats**: open tasks, hours of work left, done
- click a task → the calendar **jumps** to its deadline (try one in another month!)

### 💡 What's new? (read the file from top to bottom with these notes)

**One state object for the whole form** – instead of 4 separate `useState`s:

```jsx
const emptyForm = () => ({ title: '', deadline: addDays(todayYMD(), 7), hours: 3, priority: 'medium' });
const [form, setForm] = useState(emptyForm);

<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
```

`{ ...form, title: 'new' }` = *"copy all fields, but replace `title`"*. The default deadline is now one week ahead.

**Changing one task with `PATCH`:**

```jsx
const updateTask = async (id, changes) => {
  const updated = await api(`/tasks/${id}`, { method: 'PATCH', body: changes });
  setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
};

<input type="checkbox" checked={t.done} onChange={() => updateTask(t.id, { done: !t.done })} />
```

`prev.map((t) => (t.id === id ? updated : t))` – *"go through all tasks; use the new version for the changed one, keep the others"*. `!t.done` flips `true` ↔ `false`.

**Stats are just calculations on the list:**

```jsx
const open = tasks.filter((t) => !t.done);
const totalHours = open.reduce((s, t) => s + t.hours, 0);
const nextDeadline = [...open].sort((a, b) => a.deadline.localeCompare(b.deadline))[0];
```

**Click a task → jump there:**

```jsx
const showDay = (ymd) => {
  setMonth(fromYMD(ymd));   // show the right month
  setSelected(ymd);         // highlight the day
};
```

This is why `month` and `selected` live in the page: the **task list** can now control the calendar too.

---

## G8. ✍️ Map: a list of saved places

Back to the map! Open **`client/src/pages/MapPage.jsx`**.

**1.** After the `flyTo` function, add:

```jsx
  // NEW in step 3: delete a saved place
  const removePlace = async (id) => {
    await api(`/places/${id}`, { method: 'DELETE' });
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  };
```

**2.** Replace the line `<p className="hint">📍 {places.length} saved place(s) ...</p>` with:

```jsx
        {/* NEW: list of saved places – click to fly there */}
        <h3>Saved places</h3>
        {!places.length && <p className="hint">Click on the map to save your first place.</p>}
        <ul className="list">
          {places.map((p) => (
            <li key={p.id}>
              <span className="link" onClick={() => flyTo([p.lng, p.lat])}>{p.name}</span>
              <button className="small" onClick={() => removePlace(p.id)}>✕</button>
            </li>
          ))}
        </ul>
```

👀 **You see:** a list of your places. Click one → the camera flies there. ✕ → the place **and its pin** disappear.

💡 We didn't write any code to remove the pin! Deleting changes `places` → the marker effect from Lesson 2 (`[places]`) runs again → pins are redrawn. **Change the data, the screen follows.**

<details>
<summary>✅ <b>Checkpoint:</b> your <code>MapPage.jsx</code> should now look like this</summary>

```jsx
import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { api } from '../api.js';

// Tell MapLibre where its web worker (tile decoder) lives, so Vite can serve/bundle it
maplibregl.setWorkerUrl(workerUrl);

// Free map tiles, no API key needed: https://openfreemap.org
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

const CITIES = {
  Berlin: [13.405, 52.52],
  Cologne: [6.9603, 50.9375],
  'New York': [-73.9857, 40.7484],
  Tokyo: [139.7671, 35.6812],
};

export default function MapPage() {
  const containerRef = useRef(null); // the <div> the map is drawn into
  const mapRef = useRef(null);       // the map object, so buttons can control it
  const markersRef = useRef([]);     // the red pins currently on the map
  const [places, setPlaces] = useState([]); // NEW in step 2: places saved on the server

  // Create the map once, when the page appears
  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: CITIES.Berlin,
      zoom: 15.5,
      pitch: 60, // tilt the camera -> 3D look
      bearing: -20,
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }));

    map.on('load', () => {
      // Make sure buildings are extruded in 3D
      if (!map.getLayer('building-3d')) {
        map.addLayer({
          id: 'building-3d',
          source: 'openmaptiles',
          'source-layer': 'building',
          type: 'fill-extrusion',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': '#d6cfc4',
            'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 10],
            'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
            'fill-extrusion-opacity': 0.85,
          },
        });
      }
    });

    // NEW: click on the map -> save a place on the server
    map.on('click', async (e) => {
      const name = window.prompt('Name this place:');
      if (!name) return;
      const place = await api('/places', {
        method: 'POST',
        body: { name, lng: e.lngLat.lng, lat: e.lngLat.lat },
      });
      setPlaces((prev) => [...prev, place]);
    });

    mapRef.current = map;
    return () => map.remove(); // clean up when leaving the page
  }, []);

  // NEW: load saved places from the server
  useEffect(() => {
    api('/places').then(setPlaces).catch(console.error);
  }, []);

  // NEW: draw a red marker for every place (runs again whenever `places` changes)
  useEffect(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = places.map((p) =>
      new maplibregl.Marker({ color: '#e63946' })
        .setLngLat([p.lng, p.lat])
        .setPopup(new maplibregl.Popup().setText(p.name))
        .addTo(mapRef.current)
    );
  }, [places]);

  const flyTo = (center) =>
    mapRef.current.flyTo({ center, zoom: 16, pitch: 60, speed: 1.2 });

  // NEW in step 3: delete a saved place
  const removePlace = async (id) => {
    await api(`/places/${id}`, { method: 'DELETE' });
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="map-layout">
      <aside className="panel">
        <h2>3D Map</h2>
        <p className="hint">Drag with right mouse / Ctrl to rotate. Click the map to save a place.</p>

        <h3>Cities</h3>
        <div className="buttons">
          {Object.entries(CITIES).map(([name, center]) => (
            <button key={name} onClick={() => flyTo(center)}>{name}</button>
          ))}
        </div>

        {/* NEW: list of saved places – click to fly there */}
        <h3>Saved places</h3>
        {!places.length && <p className="hint">Click on the map to save your first place.</p>}
        <ul className="list">
          {places.map((p) => (
            <li key={p.id}>
              <span className="link" onClick={() => flyTo([p.lng, p.lat])}>{p.name}</span>
              <button className="small" onClick={() => removePlace(p.id)}>✕</button>
            </li>
          ))}
        </ul>
      </aside>
      <div ref={containerRef} className="map" />
    </div>
  );
}
```
</details>

---

## 🤔 Think about it

The calendar now shows **when things are due**. But for someone who always starts the night before, that's not enough. They need to know **when to work** on each task. → Lesson 4.

## 💪 Bonus exercises

**A.** Highlight weekends with a light background.

<details><summary>💡 Solution</summary>

In `MonthCalendar.jsx`, the position `i` of each box tells the weekday (0 = Mon … 6 = Sun):

```jsx
{cells.map(({ ymd, day, inMonth }, i) => {
  // ...
  const classes = [
    'cal-cell',
    i % 7 >= 5 && 'weekend',
    // ...
```

In `client/src/index.css`:

```css
.cal-cell.weekend { background: #fbf7ef; }
```
</details>

**B.** Ask *"Delete this task?"* before deleting.

<details><summary>💡 Solution</summary>

```jsx
const removeTask = async (id) => {
  if (!window.confirm('Delete this task?')) return;
  // ...the rest stays the same
};
```
</details>

## 📖 Words you learned

| Word | Meaning |
|---|---|
| **Props** | data a parent gives to a child component |
| **Callback prop** | a function given as a prop, so the child can report something (`onSelect`) |
| **Lifting state up** | keep state in the parent that needs it, pass it down |
| **Derived data** | calculated from state instead of stored (`events` from `tasks`) |
| **`useMemo`** | remember a calculation until its inputs change |
| **`PATCH`** | change some fields of an existing item |
| **`.find()` / `.reduce()` / `.sort()`** | find one item / combine all into one value / order a list |

## ➡️ Next

**[Lesson 4 – Planner + AI](https://github.com/amirreza98/App-dev-course/tree/step-4-planner#readme)**: the app plans *when* to work on each task.
