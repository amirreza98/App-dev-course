# App Development Course – Build two real apps

We build two apps **step by step, with our own hands**: a 🗺️ **3D Map** and a 📅 **AI Calendar** (for people who leave everything to the last minute).
**Tools:** React + Vite · Node.js + Express · MapLibre

> 📋 **Start here: [Project plan on Miro](https://miro.com/app/board/uXjVHeLSHBw=/?share_link_id=439689196857)**. Before we write any code, we walk through the full software development life cycle of this project: Planning → Requirements → Design → Development → Testing → Deployment & Maintenance.

| Step (open its tutorial) | Branch | Time |
|---|---|---|
| [0 · Your first React app](https://github.com/amirreza98/App-dev-course/tree/main#readme) **📍 you are here** | `main` | ~30 min |
| [1 · React basics](https://github.com/amirreza98/App-dev-course/tree/step-1-react#readme) | `step-1-react` | ~60 min |
| [2 · Backend](https://github.com/amirreza98/App-dev-course/tree/step-2-backend#readme) | `step-2-backend` | ~60 min |
| [3 · Calendar](https://github.com/amirreza98/App-dev-course/tree/step-3-calendar#readme) | `step-3-calendar` | ~50 min |
| [4 · Planner + AI](https://github.com/amirreza98/App-dev-course/tree/step-4-planner#readme) | `step-4-planner` | ~50 min |
| [5 · Database](https://github.com/amirreza98/App-dev-course/tree/step-5-database#readme) | `step-5-database` | ~60 min |

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

# Lesson 0 – Your first React app

| | |
|---|---|
| ⏱️ Time | ~30 min |
| 🏁 Start from | branch `main` |
| 🎯 You will | run the app, find your way around, and build your first component with **state** |

> **How every lesson works:** read a short explanation → copy (or type) the code block into the file → **save** → look at the browser.
> Every block changes something you can see. If something looks different, compare with the "✅ Checkpoint" boxes.

---

## 0.1 Run the app

Open a terminal in the project folder:

```bash
npm install
npm run dev
```

Open **http://localhost:5173**.

👀 **You see:** a dark-blue bar with *3D Map* and *AI Calendar*. Click them – each shows a "🚧 coming in step 1" page.

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

## ➡️ Next

Continue with **[Lesson 1 – React basics](https://github.com/amirreza98/App-dev-course/tree/step-1-react#readme)**. Open its tutorial on GitHub (branch `step-1-react`) and keep working in your own code – no need to switch branches.
