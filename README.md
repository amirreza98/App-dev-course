# App Development Course – Build two real apps

We build two apps **step by step, with our own hands**: a 🗺️ **3D Map** and a 📅 **AI Calendar** (for people who leave everything to the last minute).
**Tools:** React + Vite · Node.js + Express · MapLibre

| Step (open its tutorial) | Branch | Time |
|---|---|---|
| [0 · Your first React app](https://github.com/amirreza98/App-dev-course/tree/main#readme) | `main` | ~30 min |
| [1 · React basics](https://github.com/amirreza98/App-dev-course/tree/step-1-react#readme) | `step-1-react` | ~60 min |
| [2 · Backend](https://github.com/amirreza98/App-dev-course/tree/step-2-backend#readme) **📍 you are here** | `step-2-backend` | ~60 min |
| [3 · Calendar](https://github.com/amirreza98/App-dev-course/tree/step-3-calendar#readme) | `step-3-calendar` | ~50 min |
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

# Lesson 2 – Backend: saving data on a server

| | |
|---|---|
| ⏱️ Time | ~60 min |
| 🏁 Start from | your code from Lesson 1 (or `git checkout -f step-1-react`) |
| ✅ Finished result | branch `step-2-backend` |
| 🎯 You will | build a small server, so tasks survive a refresh and you can pin places on the map |

> 🆘 **Stuck or behind?** Run `git checkout -f step-2-backend && npm install` to get the finished code of this lesson.

---

## 💡 First: frontend vs. backend

| Restaurant | Web app | In our project |
|---|---|---|
| 🧑 Guest at the table | **Frontend** – runs in the browser | `client/` (React) |
| 🧑‍🍳 Kitchen | **Backend** – runs on a server | `server/` (Node + Express) – *new!* |
| 📝 Order | **Request** | "give me all tasks" |
| 🍝 Plate | **Response** | the list of tasks |

The browser forgets everything on refresh. The kitchen keeps it. The frontend **asks**, the backend **answers**.

---

# Part C – Build the server

## C1. Create the `server` project

Stop the app (**Control + C**).

**1.** Create a new folder **`server`** next to `client`, and in it a file **`server/package.json`**:

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
    "express": "^5.3.0"
  }
}
```

- **Express** is a small library for building servers
- `node --watch` restarts the server automatically when you save a file

**2.** Replace the **root** `package.json` (the one next to `client/` and `server/`) with:

```json
{
  "name": "app-dev-course",
  "private": true,
  "workspaces": ["client", "server"],
  "scripts": {
    "dev": "concurrently -n server,client -c blue,green \"npm run dev -w server\" \"npm run dev -w client\"",
    "build": "npm run build -w client"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

- `"workspaces": ["client", "server"]` – this project now has two parts
- `concurrently` starts **both** with one command: `npm run dev`

**3.** Install everything:

```bash
npm install
```

---

## C2. ✍️ Your first server

Create **`server/src/index.js`**:

```js
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
```

Start the app:

```bash
npm run dev
```

👀 **You see in the terminal** – two programs, in two colours:

```
[server] API running on http://localhost:3001
[client] Local: http://localhost:5173
```

Now open **http://localhost:3001/api/health** in the browser.
👀 **You see:** `{"ok":true}` – your server answered! 🎉

### 💡 What's happening?

- **Node.js** runs JavaScript **outside** the browser. Same language for frontend and backend!
- `express()` creates the server; `app.listen(3001)` makes it wait for requests on port 3001
- `app.get('/api/health', ...)` is a **route**: *"when a GET request arrives at `/api/health`, run this function"*
- `res.json({ ok: true })` sends back data as **JSON**
- `app.use(...)` adds **middleware** – code that runs for every request:
  - `express.json()` reads JSON that the frontend sends us
  - `cors()` allows other websites/apps to call our server (a browser safety rule)

🧪 **Try:** change `{ ok: true }` to `{ ok: true, teacher: 'YOUR NAME' }`, save, refresh the browser tab.

---

## C3. ✍️ Task routes

Create **`server/src/routes/tasks.js`**:

```js
import { Router } from 'express';

const router = Router();

// In-memory "database" — resets when the server restarts.
// Next level: replace this array with a real database (MongoDB / PostgreSQL).
let tasks = [];
let nextId = 1;

// GET /api/tasks -> list all tasks
router.get('/', (req, res) => res.json(tasks));

// POST /api/tasks -> create a task. Body: { title, deadline, hours }
router.post('/', (req, res) => {
  const { title, deadline, hours } = req.body;
  if (!title || !deadline || !hours) {
    return res.status(400).json({ error: 'title, deadline and hours are required' });
  }
  const task = { id: nextId++, title, deadline, hours: Number(hours) };
  tasks.push(task);
  res.status(201).json(task);
});

// DELETE /api/tasks/:id -> remove a task
router.delete('/:id', (req, res) => {
  tasks = tasks.filter((t) => t.id !== Number(req.params.id));
  res.status(204).end();
});

export default router;
```

Then in **`server/src/index.js`**, add the import at the top and connect the routes **above** `const PORT`:

```js
import tasksRouter from './routes/tasks.js';
```

```js
// Project 2: AI Calendar
app.use('/api/tasks', tasksRouter);
```

Open **http://localhost:3001/api/tasks**.
👀 **You see:** `[]` – an empty list of tasks. The server is ready; the frontend doesn't use it yet.

### 💡 HTTP: methods, URLs, status codes

Every request has a **method** (what to do) and a **URL** (what it's about):

| Method | Meaning | Our route |
|---|---|---|
| `GET` | read | `GET /api/tasks` → all tasks |
| `POST` | create | `POST /api/tasks` → add a task |
| `DELETE` | remove | `DELETE /api/tasks/3` → delete task 3 |

Every response has a **status code**: `200` OK · `201` created · `204` done, nothing to send · `400` *your* request is wrong · `500` *our* server crashed.

Reading the code:

- `req` = the **request** (what the frontend sent), `res` = the **response** (what we send back)
- `const { title, deadline, hours } = req.body` – take these three fields out of the sent data
- **Validation:** never trust the frontend. Missing field → `400` with an error message
- The **server** decides the `id` (`nextId++` = use it, then add 1)
- `/:id` is a **URL parameter**: for `DELETE /api/tasks/3`, `req.params.id` is `"3"`
- Our "database" is just an array **in memory**. More about that at the end of this lesson.

---

# Part D – Connect the frontend

## D1. ✍️ The bridge: proxy and `api.js`

**1.** In **`client/vite.config.js`**, replace the `server: { port: 5173 },` line with:

```js
  server: {
    port: 5173,
    // Forward /api/* calls to the Express server
    proxy: { '/api': 'http://localhost:3001' },
  },
```

The frontend runs on 5173, the backend on 3001. The **proxy** forwards every `/api/...` call:

```
Browser ──/api/tasks──▶ Vite :5173 ──forwards──▶ Express :3001
```

**2.** Create **`client/src/api.js`** – one small helper for all requests:

```js
// Tiny helper around fetch so pages stay clean.
export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} failed: ${res.status}`);
  return res.status === 204 ? null : res.json();
}
```

- `fetch` is the browser's built-in way to send a request
- `JSON.stringify(body)` turns our object into JSON text
- `res.ok` is true for status 200–299, otherwise we throw an error
- **`async` / `await`:** asking the server takes time. `await` = *"wait here until the answer arrives"*. A function that uses `await` must be `async`.

With it, a request is one line:

```js
api('/tasks')                                            // GET
api('/tasks', { method: 'POST', body: { title } })      // POST
api('/tasks/3', { method: 'DELETE' })                    // DELETE
```

---

## D2. ✍️ Save tasks on the server

Open **`client/src/pages/CalendarPage.jsx`**.

**1.** At the top, import the helper:

```jsx
import { api } from '../api.js';
```

**2.** Replace the `addTask` function with:

```jsx
  const addTask = async (e) => {
    e.preventDefault(); // don't reload the page
    if (!title.trim()) return;
    // NEW: send the task to the server; it answers with the saved task (incl. id)
    const task = await api('/tasks', { method: 'POST', body: { title, deadline, hours } });
    setTasks([...tasks, task]); // new array = React notices the change
    setTitle('');
  };
```

Add two tasks. Then open **http://localhost:3001/api/tasks** in a new tab.
👀 **You see:** your tasks as JSON – they're stored on the server now!

🤔 Go back to the app and **refresh**. The list is empty again!? But the server still has them (check the other tab)…
The page simply never **asks** the server. Let's fix that.

---

## D3. ✍️ Load tasks when the page opens

**1.** Change the first import line to also import `useEffect`:

```jsx
import { useEffect, useState } from 'react';
```

**2.** Under the `useState` lines, add:

```jsx
  // NEW in step 2: load the tasks from the server when the page opens
  useEffect(() => {
    api('/tasks').then(setTasks).catch(console.error);
  }, []);
```

👀 **You see:** your tasks are back! **Refresh** – they stay. 🎉

- `useEffect(..., [])` – run **once** when the page appears (like creating the map in Lesson 1)
- `.then(setTasks)` – another way to wait: *"when the answer arrives, put it into the state"*

---

## D4. ✍️ Delete on the server too

Delete a task and refresh… it comes back! The ✕ only removed it from the screen. Replace `removeTask`:

```jsx
  const removeTask = async (id) => {
    await api(`/tasks/${id}`, { method: 'DELETE' });
    setTasks(tasks.filter((t) => t.id !== id));
  };
```

And update the hint under the `<h2>`:

```jsx
      <p className="hint">Step 2: tasks are saved on the server. Refresh — they stay!</p>
```

👀 **You see:** delete → refresh → it stays deleted. ✅

🔎 **Look behind the scenes:** right-click → **Inspect** → **Network** tab. Add a task and click the `tasks` request: you see the method (POST), what was sent, and the server's answer.

<details>
<summary>✅ <b>Checkpoint:</b> your <code>CalendarPage.jsx</code> should now look like this</summary>

```jsx
import { useEffect, useState } from 'react';
import { api } from '../api.js';

// Today as 'YYYY-MM-DD' (the format <input type="date"> uses)
const today = () => new Date().toISOString().slice(0, 10);

export default function CalendarPage() {
  // State = data that can change. When it changes, React re-draws the page.
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState(today());
  const [hours, setHours] = useState(3);

  // NEW in step 2: load the tasks from the server when the page opens
  useEffect(() => {
    api('/tasks').then(setTasks).catch(console.error);
  }, []);

  const addTask = async (e) => {
    e.preventDefault(); // don't reload the page
    if (!title.trim()) return;
    // NEW: send the task to the server; it answers with the saved task (incl. id)
    const task = await api('/tasks', { method: 'POST', body: { title, deadline, hours } });
    setTasks([...tasks, task]); // new array = React notices the change
    setTitle('');
  };

  const removeTask = async (id) => {
    await api(`/tasks/${id}`, { method: 'DELETE' });
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div className="simple-page">
      <h2>AI Calendar</h2>
      <p className="hint">Step 2: tasks are saved on the server. Refresh — they stay!</p>

      <form className="card form" onSubmit={addTask}>
        <input
          placeholder="What do you need to do?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="row">
          <label>
            Deadline
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </label>
          <label>
            Hours
            <input type="number" min="0.5" step="0.5" value={hours}
              onChange={(e) => setHours(e.target.value)} />
          </label>
        </div>
        <button type="submit">+ Add task</button>
      </form>

      <h3>Tasks ({tasks.length})</h3>
      {!tasks.length && <p className="hint">No tasks yet.</p>}
      <ul className="task-list">
        {tasks.map((t) => (
          <li key={t.id}>
            <div className="task-info">
              <div className="task-title">{t.title}</div>
              <div className="task-meta">{t.hours}h · due {t.deadline}</div>
            </div>
            <button className="small" onClick={() => removeTask(t.id)}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```
</details>

---

# Part E – Pins on the map 📍

## E1. ✍️ Place routes

Create **`server/src/routes/places.js`** – the same idea as tasks, for places with a name and coordinates:

```js
import { Router } from 'express';

const router = Router();

// In-memory "database" — resets when the server restarts.
// Next step for students: replace with a real DB (MongoDB / PostgreSQL).
let places = [
  { id: 1, name: 'Brandenburg Gate', lng: 13.3777, lat: 52.5163 },
];
let nextId = 2;

router.get('/', (req, res) => res.json(places));

router.post('/', (req, res) => {
  const { name, lng, lat } = req.body;
  if (!name || lng == null || lat == null) {
    return res.status(400).json({ error: 'name, lng and lat are required' });
  }
  const place = { id: nextId++, name, lng: Number(lng), lat: Number(lat) };
  places.push(place);
  res.status(201).json(place);
});

router.delete('/:id', (req, res) => {
  places = places.filter((p) => p.id !== Number(req.params.id));
  res.status(204).end();
});

export default router;
```

It starts with one example: the Brandenburg Gate.

In **`server/src/index.js`**, add the import and the route:

```js
import placesRouter from './routes/places.js';
```

```js
// Project 1: 3D Map
app.use('/api/places', placesRouter);
```

Check **http://localhost:3001/api/places** → 👀 you see the Brandenburg Gate as JSON.

<details>
<summary>✅ <b>Checkpoint:</b> <code>server/src/index.js</code></summary>

```js
import express from 'express';
import cors from 'cors';
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
```
</details>

---

## E2. ✍️ Show the places as pins

Open **`client/src/pages/MapPage.jsx`**.

**1.** Change the imports: add `useState`, and import the helper:

```jsx
import { useEffect, useRef, useState } from 'react';
```

```jsx
import { api } from '../api.js';
```

**2.** Under `const mapRef = ...`, add:

```jsx
  const markersRef = useRef([]);     // the red pins currently on the map
  const [places, setPlaces] = useState([]); // NEW in step 2: places saved on the server
```

**3.** **After** the big `useEffect` (after its closing `}, []);`), add two more effects:

```jsx
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
```

👀 **You see:** a red pin on the Brandenburg Gate. Click it → its name pops up.

### 💡 The dependency list decides *when* an effect runs

| Dependency list | Runs… |
|---|---|
| `[]` | once, when the page appears |
| `[places]` | at the start **and every time `places` changes** |

The second effect removes all old pins and draws one pin per place. Whenever the list changes, the pins update **automatically**.

---

## E3. ✍️ Click to save a place

**1.** Inside the **first** `useEffect` (the one that creates the map), just **before** `mapRef.current = map;`, add:

```jsx
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
```

**2.** In the side panel, update the hint and show how many places there are:

```jsx
        <p className="hint">Drag with right mouse / Ctrl to rotate. Click the map to save a place.</p>
```

```jsx
        <p className="hint">📍 {places.length} saved place(s) — click a red pin to see its name.</p>
```

(put the second one after the city buttons, before `</aside>`)

👀 **You see:** click any building → name it → a new red pin appears. **Refresh** – all pins are still there! 🎉

💡 `e.lngLat` – the coordinates where you clicked.
💡 `setPlaces((prev) => [...prev, place])` – the **function form** of setState: *"take the latest list and add this place"*. We need it here because this click listener was created once, at the start – a plain `places` inside it would be stuck at its old value (the empty list).

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

        <p className="hint">📍 {places.length} saved place(s) — click a red pin to see its name.</p>
      </aside>
      <div ref={containerRef} className="map" />
    </div>
  );
}
```
</details>

---

## 🤔 One last experiment

Stop the app (**Control + C**) and start it again. Your tasks and places are **gone**!

The server keeps data in an array **in memory** – a restart wipes it. Real apps use a **database** (PostgreSQL, MongoDB…) that writes to disk. A great idea for your own project later!

## 💪 Bonus exercises

**A.** Add a route `GET /api/tasks/count` that returns `{ "count": 3 }`.

<details><summary>💡 Solution</summary>

In `server/src/routes/tasks.js`, **above** the `/:id` route:

```js
router.get('/count', (req, res) => res.json({ count: tasks.length }));
```
</details>

**B.** Make the server reject tasks with 0 or negative hours.

<details><summary>💡 Solution</summary>

```js
if (!title || !deadline || !(Number(hours) > 0)) {
  return res.status(400).json({ error: 'title, deadline and positive hours are required' });
}
```
</details>

## 📖 Words you learned

| Word | Meaning |
|---|---|
| **Frontend / backend** | the part in the browser / the part on the server |
| **Request / response** | the question the frontend sends / the answer |
| **HTTP method** | `GET` read · `POST` create · `DELETE` remove |
| **Status code** | 200 ok · 201 created · 400 your mistake · 500 server's mistake |
| **JSON** | text format for data, looks like a JS object |
| **Route** | "for this method + URL, run this function" |
| **Middleware** | code that runs for every request (`cors`, `express.json`) |
| **`async` / `await`** | wait for something slow (like a server answer) |
| **Proxy** | Vite forwards `/api` calls to the backend |

## ➡️ Next

**[Lesson 3 – Calendar](https://github.com/amirreza98/App-dev-course/tree/step-3-calendar#readme)**: we show all deadlines on a real month calendar.
