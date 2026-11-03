# App Development Course – Build two real apps

We build two apps **step by step, with our own hands**: a 🗺️ **3D Map** and a 📅 **AI Calendar** (for people who leave everything to the last minute).
**Tools:** React + Vite · Node.js + Express · MapLibre

> 📋 **Start here: [Project plan on Miro](https://miro.com/app/board/uXjVHeLSHBw=/?share_link_id=439689196857)**. Before we write any code, we walk through the full software development life cycle of this project: Planning → Requirements → Design → Development → Testing → Deployment & Maintenance.

| Step (open its tutorial) | Branch | Time |
|---|---|---|
| [0 · Your first React app](https://github.com/amirreza98/App-dev-course/tree/main#readme) **📍 you are here** | `main` | ~45 min |
| [1 · React basics](https://github.com/amirreza98/App-dev-course/tree/step-1-react#readme) | `step-1-react` | ~60 min |
| [2 · Backend](https://github.com/amirreza98/App-dev-course/tree/step-2-backend#readme) | `step-2-backend` | ~60 min |
| [3 · Calendar](https://github.com/amirreza98/App-dev-course/tree/step-3-calendar#readme) | `step-3-calendar` | ~50 min |
| [4 · Planner + AI](https://github.com/amirreza98/App-dev-course/tree/step-4-planner#readme) | `step-4-planner` | ~50 min |
| [5 · Database](https://github.com/amirreza98/App-dev-course/tree/step-5-database#readme) | `step-5-database` | ~60 min |
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

# Lesson 0 – Your first React app

| | |
|---|---|
| ⏱️ Time | ~45 min |
| 🏁 Start from | an **empty folder** – we build everything from zero |
| ✅ Finished result | branch `main` |
| 🎯 You will | create the project yourself, run it, find your way around, and build your first component with **state** |

> **How every lesson works:** read a short explanation → copy (or type) the code block into the file → **save** → look at the browser.
> Every block changes something you can see. If something looks different, compare with the "✅ Checkpoint" boxes.

> 🆘 **Stuck or behind?** Run `git clone https://github.com/amirreza98/App-dev-course.git && cd App-dev-course && npm install` – the `main` branch is the finished result of 0.1.

---

## 0.1 ✍️ Create the project from zero

### Install the tools (once)

- **Node.js** (LTS, 20.19 or newer): https://nodejs.org – check in a terminal with `node -v`
- **VS Code**: https://code.visualstudio.com
- **Git**: https://git-scm.com – check with `git --version`

### Step 1 – Create the project folder

Open a terminal and run:

```bash
mkdir app-dev-course
cd app-dev-course
git init
```

`app-dev-course` is the **root folder** of our project. Everything from now on happens inside it. Open it in VS Code (**File → Open Folder…**).

### Step 2 – Let Vite create a React app

```bash
npm create vite@latest client -- --template react --no-interactive
```

This creates a folder **`client/`** with a ready-made React app (the **frontend**). Vite gives us more than we need, so we clean up first.

### Step 3 – Delete the files we don't need

Delete these files and folders inside `client/` (in VS Code: right-click → **Delete**):

| Delete | Why |
|---|---|
| `client/.gitignore` | we use one `.gitignore` for the whole project |
| `client/.oxlintrc.json` | linter settings – not used in this course |
| `client/README.md` | our README lives in the root folder |
| `client/public/` (the whole folder) | demo icons |
| `client/src/assets/` (the whole folder) | demo images |
| `client/src/App.css` | demo styles – all our styles go in `index.css` |

Or in the terminal (macOS / Linux / Git Bash):

```bash
rm -rf client/.gitignore client/.oxlintrc.json client/README.md client/public client/src/assets client/src/App.css
```

✅ What is left in `client/`: `index.html`, `package.json`, `vite.config.js` and `src/` with `App.jsx`, `index.css` and `main.jsx`.

### Step 4 – Files in the root folder

Create **`package.json`** in the **root** folder (next to `client/`, not inside it):

```json
{
  "name": "app-dev-course",
  "private": true,
  "workspaces": ["client"],
  "scripts": {
    "dev": "npm run dev -w client",
    "build": "npm run build -w client"
  }
}
```

- `"workspaces": ["client"]` – our project has parts; for now only `client`. In Lesson 2 we add `server`.
- `npm run dev` in the root folder starts the frontend

Create **`.gitignore`** in the root folder – files git must never save:

```
node_modules/
dist/
.env
.DS_Store
```

### Step 5 – Replace the frontend settings

Replace **everything** in **`client/package.json`** with:

```json
{
  "name": "client",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.3.1",
    "react-dom": "^19.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.1.2",
    "vite": "^8.3.5"
  }
}
```

Replace **`client/vite.config.js`** with:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Always use one copy of React (prevents "Invalid hook call")
  resolve: { dedupe: ['react', 'react-dom'] },
  server: { port: 5173 },
});
```

- `dedupe` makes sure there is only **one** copy of React (two copies cause an *"Invalid hook call"* error)
- `port: 5173` – the address of our app: `http://localhost:5173`

Replace **`client/index.html`** with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>App Dev Course – Student Projects</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### Step 6 – Replace the React files

Replace **`client/src/main.jsx`** with:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Replace **`client/src/index.css`** with these ready-made styles (they already contain the styles for all lessons, so we can focus on JavaScript – just copy them):

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
```

Replace **`client/src/App.jsx`** with:

```jsx
import { useState } from 'react';
import MapPage from './pages/MapPage.jsx';
import CalendarPage from './pages/CalendarPage.jsx';

const PAGES = {
  map: { label: '🗺️ 3D Map', component: MapPage },
  calendar: { label: '📅 AI Calendar', component: CalendarPage },
};

export default function App() {
  const [page, setPage] = useState('map');
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
      </nav>
      <main className="main">
        <Page />
      </main>
    </div>
  );
}
```

### Step 7 – Create the two pages

Create the folder **`client/src/pages`** and in it the file **`client/src/pages/MapPage.jsx`**:

```jsx
// Project 1: 3D Map
// In step 1 we turn this placeholder into a real 3D map.

export default function MapPage() {
  return (
    <div className="simple-page">
      <h2>🗺️ 3D Map</h2>
      <p>A 3D Google-Maps-style viewer: tilted camera, 3D buildings, saved places.</p>
      <div className="card">
        <p className="hint">🚧 Coming in step 1 — switch with <code>git checkout -f step-1-react</code></p>
      </div>
    </div>
  );
}
```

and **`client/src/pages/CalendarPage.jsx`**:

```jsx
// Project 2: AI Calendar
// In step 1 we turn this placeholder into a task list.

export default function CalendarPage() {
  return (
    <div className="simple-page">
      <h2>📅 AI Calendar</h2>
      <p>For people who push everything to the last minute: it spreads your work out before every deadline.</p>
      <div className="card">
        <p className="hint">🚧 Coming in step 1 — switch with <code>git checkout -f step-1-react</code></p>
      </div>
    </div>
  );
}
```

✅ **Checkpoint** – your project now looks like this:

```
app-dev-course/
├── .gitignore
├── package.json
└── client/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        └── pages/
            ├── MapPage.jsx
            └── CalendarPage.jsx
```

### Step 8 – Install and start

In the **root** folder:

```bash
npm install
npm run dev
```

Open **http://localhost:5173**.

👀 **You see:** a dark-blue bar with *3D Map* and *AI Calendar*. Click them – each shows a "🚧 coming in step 1" page.

Save your work in git:

```bash
git add .
git commit -m "Lesson 0: React + Vite starter"
```

### 💡 What just happened?

- **npm** installs libraries other people wrote. `package.json` is the *shopping list*, `npm install` *goes shopping* and puts everything in `node_modules/`.
- **`npm run dev`** starts **Vite**: a small development server at `localhost:5173`. It translates our code for the browser and **reloads instantly** when you save a file.
- **React** is the library we write the app with. We build the page out of **components** – small LEGO bricks that we combine.

Leave the terminal running. To stop it later: **Control + C**.

---

## 0.2 Find your way around

Open the project in VS Code. Everything for the browser lives in `client/`:

```
client/
├── index.html          ← the ONE html page
└── src/
    ├── main.jsx        ← starts React
    ├── App.jsx         ← navigation bar + current page
    ├── index.css       ← all styles (ready-made, so we focus on JavaScript)
    └── pages/
        ├── MapPage.jsx
        └── CalendarPage.jsx
```

### 👀 Open `client/index.html`

```html
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

The page is empty except for one `<div id="root">`. React draws **everything** inside it.
One HTML page, JavaScript changes what you see = a **Single Page Application**.

### 👀 Open `client/src/main.jsx`

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

In plain words: *"React, draw the `App` component inside `<div id="root">`."*
`<App />` looks like an HTML tag, but it's **our** component. Components always start with a **capital letter**.

### 👀 Open `client/src/pages/CalendarPage.jsx`

```jsx
export default function CalendarPage() {
  return (
    <div className="simple-page">
      <h2>📅 AI Calendar</h2>
      ...
    </div>
  );
}
```

⭐ **A component is a function that returns what should appear on the screen.**
The HTML-like code inside JavaScript is called **JSX**. Two differences to HTML:
- `className` instead of `class`
- `{ }` means *"JavaScript here"* – you'll see it everywhere

---

## 0.3 ✍️ Your first change

In `CalendarPage.jsx`, change the heading:

```jsx
<h2>📅 My AI Calendar</h2>
```

**Save** (Cmd + S / Ctrl + S).

👀 **You see:** the browser updated by itself – no refresh. That's Vite's **hot reload**.

🧪 Now delete the `>` after `<h2`, save, and look at the browser and the terminal: an error message, with the file and line. Put the `>` back. Reading errors is a normal part of programming!

---

## 0.4 ✍️ Build a new page

Create a new file **`client/src/pages/AboutPage.jsx`**:

```jsx
export default function AboutPage() {
  return (
    <div className="simple-page">
      <h2>👋 About</h2>
      <p>Made by YOUR NAME</p>
    </div>
  );
}
```

Put your name in. Nothing changes in the browser yet – nobody *uses* this component.

### Add it to the menu

Open **`client/src/App.jsx`**. At the top you see the list of pages:

```jsx
const PAGES = {
  map: { label: '🗺️ 3D Map', component: MapPage },
  calendar: { label: '📅 AI Calendar', component: CalendarPage },
};
```

`PAGES` is an **object**: a list of *key → value* pairs. Add your page – first the import (at the top, next to the other imports), then a new line in `PAGES`:

```jsx
import AboutPage from './pages/AboutPage.jsx';
```

```jsx
const PAGES = {
  map: { label: '🗺️ 3D Map', component: MapPage },
  calendar: { label: '📅 AI Calendar', component: CalendarPage },
  about: { label: '👋 About', component: AboutPage },
};
```

👀 **You see:** a third link *👋 About* in the menu. Click it!

### 💡 Why did the menu update by itself?

Look further down in `App.jsx`:

```jsx
{Object.entries(PAGES).map(([key, { label }]) => (
  <a key={key} href="#" onClick={(e) => { e.preventDefault(); setPage(key); }}>
    {label}
  </a>
))}
```

`.map()` goes through **every** page in `PAGES` and makes one `<a>` link for it. Add a page to the data → a new link appears. **The UI is built from data.**

---

## 0.5 ✍️ State: the component's memory

Let's add a ❤️ button that counts clicks. First, the **wrong** way. Replace `AboutPage.jsx` with:

```jsx
export default function AboutPage() {
  let likes = 0;

  const like = () => {
    likes = likes + 1;
    console.log('likes is now', likes);
  };

  return (
    <div className="simple-page">
      <h2>👋 About</h2>
      <p>Made by YOUR NAME</p>
      <button onClick={like}>❤️ {likes}</button>
    </div>
  );
}
```

Click the button a few times.

👀 **You see:** the button stays at **❤️ 0**!
Open the browser console (right-click → **Inspect** → **Console**): the number *does* go up there. So why doesn't the screen change?

> React only redraws a component when it knows something changed. A normal variable changes **silently**.

### Now the right way: `useState`

```jsx
import { useState } from 'react';

export default function AboutPage() {
  const [likes, setLikes] = useState(0);

  return (
    <div className="simple-page">
      <h2>👋 About</h2>
      <p>Made by YOUR NAME</p>
      <button onClick={() => setLikes(likes + 1)}>❤️ {likes}</button>
    </div>
  );
}
```

👀 **You see:** the number goes up with every click! 🎉

### 💡 `useState` – the most important idea in React

```jsx
const [likes, setLikes] = useState(0);
```

`useState(0)` gives you two things:
- `likes` – the current value (starts at `0`)
- `setLikes` – the function to change it

When you call `setLikes(...)`, React **remembers** the new value and **redraws** the component.

```
click → setLikes(1) → React runs AboutPage() again → button shows ❤️ 1
```

> 🧠 **State** = data that can change while the app runs. You never change the screen yourself – you change the state, and React updates the screen.

The navigation in `App.jsx` works exactly the same way:

```jsx
const [page, setPage] = useState('map');
```

Clicking a menu link calls `setPage('calendar')` → React redraws `App` → it shows the calendar page.

---

## 📖 Words you learned

| Word | Meaning |
|---|---|
| **Component** | a function that returns a piece of UI (a LEGO brick) |
| **JSX** | HTML-like code inside JavaScript; `{ }` = JavaScript here |
| **State** (`useState`) | a component's memory; changing it redraws the screen |
| **`.map()`** | turn a list of data into a list of elements |
| **Hot reload** | save a file → the browser updates instantly |

## 🧹 Before Lesson 1: tidy up

The About page was practice – it is not part of the course app. Remove it so your code matches the course exactly:

1. Delete **`client/src/pages/AboutPage.jsx`**
2. In **`client/src/App.jsx`**, remove the line `import AboutPage from './pages/AboutPage.jsx';` and the line `about: { label: '👋 About', component: AboutPage },`

👀 **You see:** the menu shows only *3D Map* and *AI Calendar* again.

```bash
git add .
git commit -m "Lesson 0 done"
```

## ➡️ Next

Continue with **[Lesson 1 – React basics](https://github.com/amirreza98/App-dev-course/tree/step-1-react#readme)**. Open its tutorial on GitHub (branch `step-1-react`) and keep working in your own code – no need to switch branches.
