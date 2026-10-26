# App Development Course – Build two real apps

We build two apps **step by step, with our own hands**: a 🗺️ **3D Map** and a 📅 **AI Calendar** (for people who leave everything to the last minute).
**Tools:** React + Vite · Node.js + Express · MapLibre

> 📋 **Start here: [Project plan on Miro](https://miro.com/app/board/uXjVHeLSHBw=/?share_link_id=439689196857)**. Before we write any code, we walk through the full software development life cycle of this project: Planning → Requirements → Design → Development → Testing → Deployment & Maintenance.

| Step (open its tutorial) | Branch | Time |
|---|---|---|
| [0 · Your first React app](https://github.com/amirreza98/App-dev-course/tree/main#readme) | `main` | ~30 min |
| [1 · React basics](https://github.com/amirreza98/App-dev-course/tree/step-1-react#readme) **📍 you are here** | `step-1-react` | ~60 min |
| [2 · Backend](https://github.com/amirreza98/App-dev-course/tree/step-2-backend#readme) | `step-2-backend` | ~60 min |
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

# Lesson 1 – React basics: a 3D map and a task list

| | |
|---|---|
| ⏱️ Time | ~60 min |
| 🏁 Start from | your code from Lesson 0 (or `git checkout -f main`) |
| ✅ Finished result | branch `step-1-react` |
| 🎯 You will | build a 3D map you can fly around, and a task list with a form |

> 🆘 **Stuck or behind?** Run `git checkout -f step-1-react` to get the finished code of this lesson, then continue with Lesson 2.

---

# Part A – The 3D map 🗺️

## A1. Install a map library

Drawing a 3D map ourselves would take months. We use the free library **MapLibre**. Stop the app (**Control + C**) and run:

```bash
npm install maplibre-gl -w client
```

`-w client` means *"install it for the frontend"*. Open `client/package.json` – there's a new line `"maplibre-gl"` under `dependencies`.

Now open **`client/vite.config.js`** and add the two lines marked `NEW`:

```js
export default defineConfig({
  plugins: [react()],
  // Always use one copy of React (prevents "Invalid hook call")
  resolve: { dedupe: ['react', 'react-dom'] },
  // NEW: MapLibre loads its web worker relative to its own file; pre-bundling breaks that
  optimizeDeps: { exclude: ['maplibre-gl'] },
  server: { port: 5173 },
});
```

This is a technical setting for this library – just copy it. Start the app again: `npm run dev`.

---

## A2. ✍️ Show a map

Replace **everything** in **`client/src/pages/MapPage.jsx`** with:

```jsx
import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';

// Tell MapLibre where its web worker (tile decoder) lives, so Vite can serve/bundle it
maplibregl.setWorkerUrl(workerUrl);

// Free map tiles, no API key needed: https://openfreemap.org
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

export default function MapPage() {
  const containerRef = useRef(null); // the <div> the map is drawn into

  // Create the map once, when the page appears
  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [13.405, 52.52],
      zoom: 15.5,
    });

    return () => map.remove(); // clean up when leaving the page
  }, []);

  return (
    <div className="map-layout">
      <div ref={containerRef} className="map" />
    </div>
  );
}
```

👀 **You see:** a map of Berlin! Drag it with the mouse, zoom with the scroll wheel.

### 💡 What's new here?

**`import`** – load code from a library. We import MapLibre and its CSS.

**The map options**

| Option | Meaning |
|---|---|
| `center: [13.405, 52.52]` | where the camera looks: **[longitude, latitude]** |
| `zoom: 15.5` | 0 = whole world, ~16 = street level |
| `style` | which map design to use (we use free tiles from OpenFreeMap) |

**`useRef`** – a box that holds on to something. Here: the real `<div>` on the page.

```jsx
const containerRef = useRef(null);
<div ref={containerRef} />      // now containerRef.current is that <div>
```

**`useEffect`** – run code **after** React has put the HTML on the screen. The map needs an existing `<div>` to draw into, so we create it there.

```jsx
useEffect(() => {
  // runs once, after the page appears
  return () => { /* runs when the page disappears: clean up */ };
}, []);   // [] = only once
```

Switch to *AI Calendar* and back – the `return () => map.remove()` cleans up the old map each time.

🧪 **Try:** change `zoom: 15.5` to `zoom: 3` and save. Then change it back.

---

## A3. ✍️ Tilt the camera

In the map options, add **`pitch`** and **`bearing`** after `zoom`:

```jsx
      zoom: 15.5,
      pitch: 60, // tilt the camera -> 3D look
      bearing: -20,
    });
```

👀 **You see:** the map is tilted, like looking from a plane window.

- `pitch` = tilt in degrees (0 = straight down, 60 = strongly tilted)
- `bearing` = rotation (which direction is "up")

---

## A4. ✍️ Add zoom buttons

Right **after** the `new maplibregl.Map({ ... });` block, add:

```jsx
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }));
```

👀 **You see:** **+ / − / compass** buttons top right. Drag the compass to tilt and rotate.

---

## A5. ✍️ 3D buildings

Below the `map.addControl(...)` line, add:

```jsx
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
```

👀 **You see:** buildings standing up in 3D! Hold the **right mouse button** (or **Ctrl + drag**) to rotate around them.

### 💡 What's happening?

- `map.on('load', ...)` – an **event listener**: *"when the map has loaded, run this function"*
- The map data contains every building's outline **and its real height** (`render_height`)
- A **layer** is one thing drawn on the map. `fill-extrusion` takes a flat shape and **pulls it up** to its height
- `minzoom: 14` – only when zoomed in (otherwise too many buildings)

🧪 **Try:** change `'#d6cfc4'` to `'#e63946'` – red city! (Change it back after.)

---

## A6. ✍️ Fly to cities

Four small changes:

**1.** Above `export default function MapPage()`, add a list of cities:

```jsx
const CITIES = {
  Berlin: [13.405, 52.52],
  Cologne: [6.9603, 50.9375],
  'New York': [-73.9857, 40.7484],
  Tokyo: [139.7671, 35.6812],
};
```

**2.** Under `const containerRef = ...`, add a second ref – to hold on to the map itself:

```jsx
  const mapRef = useRef(null);       // the map object, so buttons can control it
```

and use Berlin from the list as start point: `center: CITIES.Berlin,`

**3.** Inside the `useEffect`, just **before** `return () => map.remove();`, save the map in that ref:

```jsx
    mapRef.current = map;
```

**4.** Add a `flyTo` function **after** the `useEffect`, and a side panel with one button per city in the JSX:

```jsx
  const flyTo = (center) =>
    mapRef.current.flyTo({ center, zoom: 16, pitch: 60, speed: 1.2 });

  return (
    <div className="map-layout">
      <aside className="panel">
        <h2>3D Map</h2>
        <p className="hint">Drag with right mouse / Ctrl to rotate.</p>

        <h3>Cities</h3>
        <div className="buttons">
          {Object.entries(CITIES).map(([name, center]) => (
            <button key={name} onClick={() => flyTo(center)}>{name}</button>
          ))}
        </div>
      </aside>
      <div ref={containerRef} className="map" />
    </div>
  );
```

👀 **You see:** a side panel with city buttons. Click **Tokyo** – the camera flies across the world! ✈️

### 💡 What's new?

- `Object.entries(CITIES)` turns the object into a list: `[['Berlin', [13.4, 52.5]], ['Cologne', …], …]`
- `.map()` makes one `<button>` per city (like the menu in Lesson 0)
- `onClick={() => flyTo(center)}` – when clicked, call `flyTo` with *this* city's coordinates
- `mapRef.current` – the map we saved in step 3. The button needs it, but it lives inside the `useEffect`; the ref connects the two

| | `useState` | `useRef` |
|---|---|---|
| remembers a value | ✅ | ✅ |
| changing it redraws the screen | ✅ | ❌ |
| use for | data you **show** | things you **hold on to** (map, a `<div>`) |

<details>
<summary>✅ <b>Checkpoint:</b> your <code>MapPage.jsx</code> should now look like this</summary>

```jsx
import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';

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

    mapRef.current = map;
    return () => map.remove(); // clean up when leaving the page
  }, []);

  const flyTo = (center) =>
    mapRef.current.flyTo({ center, zoom: 16, pitch: 60, speed: 1.2 });

  return (
    <div className="map-layout">
      <aside className="panel">
        <h2>3D Map</h2>
        <p className="hint">Drag with right mouse / Ctrl to rotate.</p>

        <h3>Cities</h3>
        <div className="buttons">
          {Object.entries(CITIES).map(([name, center]) => (
            <button key={name} onClick={() => flyTo(center)}>{name}</button>
          ))}
        </div>
      </aside>
      <div ref={containerRef} className="map" />
    </div>
  );
}
```
</details>

---

# Part B – The task list 📅

## B1. ✍️ A form (that doesn't work yet)

Replace **everything** in **`client/src/pages/CalendarPage.jsx`** with:

```jsx
export default function CalendarPage() {
  return (
    <div className="simple-page">
      <h2>AI Calendar</h2>

      <form className="card form">
        <input placeholder="What do you need to do?" />
        <button type="submit">+ Add task</button>
      </form>
    </div>
  );
}
```

👀 **You see:** an input and a button. Type something and click **+ Add task**…
…the page **reloads** and your text is gone. That's what HTML forms do by default. We'll fix it in B3.

---

## B2. ✍️ Connect the input to state

Replace the file with:

```jsx
import { useState } from 'react';

export default function CalendarPage() {
  const [title, setTitle] = useState('');

  return (
    <div className="simple-page">
      <h2>AI Calendar</h2>

      <form className="card form">
        <input
          placeholder="What do you need to do?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">+ Add task</button>
      </form>

      <p>You typed: {title}</p>
    </div>
  );
}
```

👀 **You see:** whatever you type appears live below the form.

### 💡 A "controlled input"

```
you type "a" → onChange → setTitle('a') → React redraws → input shows "a", <p> shows "a"
```

- `value={title}` – the input always shows what's in the state
- `onChange` – runs on every key press; `e.target.value` is the text in the field

The **state** is the single source of truth. The input and the `<p>` both just *show* it.

---

## B3. ✍️ Add tasks to a list

Replace the file with:

```jsx
import { useState } from 'react';

export default function CalendarPage() {
  // State = data that can change. When it changes, React re-draws the page.
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');

  const addTask = (e) => {
    e.preventDefault(); // don't reload the page
    if (!title.trim()) return;
    const task = { id: Date.now(), title };
    setTasks([...tasks, task]); // new array = React notices the change
    setTitle('');
  };

  return (
    <div className="simple-page">
      <h2>AI Calendar</h2>

      <form className="card form" onSubmit={addTask}>
        <input
          placeholder="What do you need to do?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">+ Add task</button>
      </form>

      <ul className="task-list">
        {tasks.map((t) => (
          <li key={t.id}>
            <div className="task-info">
              <div className="task-title">{t.title}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

👀 **You see:** type a task, press **Enter** or click the button → it appears in the list. No more page reload!

### 💡 What's new?

**`onSubmit={addTask}`** – runs when the button is clicked **or** Enter is pressed.
**`e.preventDefault()`** – stops the browser's default (the reload from B1).

**Adding to a list in state – never change, always replace:**

```jsx
setTasks([...tasks, task]);
```

`...tasks` is the **spread operator**: *"copy all old tasks here"*, then add the new one at the end. This makes a **new** array.

> ❓ Why not `tasks.push(task)`? React compares old and new. If you change the *same* array, React thinks nothing changed → no redraw.

**Showing a list – `.map()` with a `key`:**

```jsx
{tasks.map((t) => (
  <li key={t.id}>...</li>
))}
```

Every task (data) becomes one `<li>` (UI). The `key` must be unique so React can tell the items apart. `Date.now()` (milliseconds since 1970) is a quick unique id.

---

## B4. ✍️ Deadline and hours

**1.** Above the component, add a helper for today's date:

```jsx
// Today as 'YYYY-MM-DD' (the format <input type="date"> uses)
const today = () => new Date().toISOString().slice(0, 10);
```

**2.** Under the `title` state, add two more:

```jsx
  const [deadline, setDeadline] = useState(today());
  const [hours, setHours] = useState(3);
```

**3.** In `addTask`, save them in the task:

```jsx
    const task = { id: Date.now(), title, deadline, hours: Number(hours) };
```

**4.** In the form, between the text input and the button, add:

```jsx
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
```

**5.** In the list, under the title, show them:

```jsx
              <div className="task-meta">{t.hours}h · due {t.deadline}</div>
```

👀 **You see:** a date picker and an hours field; each task shows *"3h · due 2026-11-02"*.

💡 `Number(hours)` – inputs always give **text** (`"3"`). We want a **number** (`3`) so we can calculate with it later.
💡 `{ title, deadline }` is short for `{ title: title, deadline: deadline }`.

<details>
<summary>📄 Full file so far</summary>

```jsx
import { useState } from 'react';

// Today as 'YYYY-MM-DD' (the format <input type="date"> uses)
const today = () => new Date().toISOString().slice(0, 10);

export default function CalendarPage() {
  // State = data that can change. When it changes, React re-draws the page.
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState(today());
  const [hours, setHours] = useState(3);

  const addTask = (e) => {
    e.preventDefault(); // don't reload the page
    if (!title.trim()) return;
    const task = { id: Date.now(), title, deadline, hours: Number(hours) };
    setTasks([...tasks, task]); // new array = React notices the change
    setTitle('');
  };

  return (
    <div className="simple-page">
      <h2>AI Calendar</h2>

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

      <ul className="task-list">
        {tasks.map((t) => (
          <li key={t.id}>
            <div className="task-info">
              <div className="task-title">{t.title}</div>
              <div className="task-meta">{t.hours}h · due {t.deadline}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```
</details>

---

## B5. ✍️ Delete tasks and polish

**1.** Under `addTask`, add:

```jsx
  const removeTask = (id) => setTasks(tasks.filter((t) => t.id !== id));
```

`.filter()` makes a **new** list with only the tasks where the condition is true – *"every task except this one"*.

**2.** In each `<li>`, after the `task-info` div, add a delete button:

```jsx
            <button className="small" onClick={() => removeTask(t.id)}>✕</button>
```

**3.** Above the `<ul>`, add a heading with the count and a message when the list is empty:

```jsx
      <h3>Tasks ({tasks.length})</h3>
      {!tasks.length && <p className="hint">No tasks yet.</p>}
```

**4.** Under the `<h2>`, add a hint:

```jsx
      <p className="hint">Step 1: tasks live only in the browser. Refresh the page and they are gone.</p>
```

👀 **You see:** *"Tasks (2)"*, ✕ buttons that delete, and *"No tasks yet."* when the list is empty.

💡 `{!tasks.length && <p>...</p>}` is **conditional rendering**: *"if there are no tasks, show this"*. `&&` = only if the left side is true, show the right side.

<details>
<summary>✅ <b>Checkpoint:</b> your <code>CalendarPage.jsx</code> should now look like this</summary>

```jsx
import { useState } from 'react';

// Today as 'YYYY-MM-DD' (the format <input type="date"> uses)
const today = () => new Date().toISOString().slice(0, 10);

export default function CalendarPage() {
  // State = data that can change. When it changes, React re-draws the page.
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState(today());
  const [hours, setHours] = useState(3);

  const addTask = (e) => {
    e.preventDefault(); // don't reload the page
    if (!title.trim()) return;
    const task = { id: Date.now(), title, deadline, hours: Number(hours) };
    setTasks([...tasks, task]); // new array = React notices the change
    setTitle('');
  };

  const removeTask = (id) => setTasks(tasks.filter((t) => t.id !== id));

  return (
    <div className="simple-page">
      <h2>AI Calendar</h2>
      <p className="hint">Step 1: tasks live only in the browser. Refresh the page and they are gone.</p>

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

## 🤔 One last experiment

Add three tasks. Now **refresh the page**.

They're gone! Why? **State lives in the browser's memory** – a refresh wipes it.
To keep data, we have to store it somewhere else: on a **server**. That's Lesson 2.

## 💪 Bonus exercises

**A.** Add your own city to `CITIES`. *(Tip: right-click a place in Google Maps to copy its coordinates. Google shows **latitude, longitude** – MapLibre wants them the other way round!)*

**B.** Show the total hours under the list: *"Total: 12h"*.

<details><summary>💡 Solution B</summary>

```jsx
const totalHours = tasks.reduce((sum, t) => sum + t.hours, 0);
// in the JSX:
<p>Total: {totalHours}h</p>
```

`.reduce()` walks through the list and adds everything up, starting at `0`.
</details>

## 📖 Words you learned

| Word | Meaning |
|---|---|
| **Library** | code someone else wrote, installed with npm |
| **`useEffect`** | run code after the component appears (+ clean up when it leaves) |
| **`useRef`** | hold on to something without redrawing (the map, a `<div>`) |
| **Event listener** | "when X happens, run this" (`onClick`, `map.on('load')`) |
| **Controlled input** | an input whose value comes from state |
| **Spread `...`** | copy all items into a new array |
| **`.map()` / `.filter()`** | new list by transforming / by selecting items |
| **Conditional rendering** | show something only if a condition is true |

## ➡️ Next

**[Lesson 2 – Backend](https://github.com/amirreza98/App-dev-course/tree/step-2-backend#readme)**: we build a server so data survives a refresh.
