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
| [7 · Go live](https://github.com/amirreza98/App-dev-course/tree/step-7-deploy#readme) | `step-7-deploy` | ~75 min |
| [8 · Mobile app](https://github.com/amirreza98/App-dev-course/tree/step-8-mobile#readme) | `step-8-mobile` | ~3 h |
| [9 · Reminders](https://github.com/amirreza98/App-dev-course/tree/step-9-reminders#readme) | `step-9-reminders` | ~60 min |
| [10 · Campus 3D + VR](https://github.com/amirreza98/App-dev-course/tree/step-10-campus-3d#readme) **📍 you are here** | `step-10-campus-3d` | ~90 min |

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

# Lesson 10 – Campus 3D: walk through your campus (+ VR)

| | |
|---|---|
| ⏱️ Time | ~90 min |
| 🏁 Start from | your code from Lesson 9 (or `git checkout -f step-9-reminders`) |
| ✅ Finished result | branch `step-10-campus-3d` |
| 🎯 You will | build a **3D campus** in the browser: buildings you can open floor by floor, a room search, a street view – and **VR** on a headset |

> 🆘 **Stuck or behind?** Run `git checkout -f step-10-campus-3d && npm install && npm run dev`.

---

## 💡 From a map to a world

Our 3D map (Lesson 1) shows buildings from the outside. New students get lost **inside** the campus: *"Where is Room A2.14? Which floor is the library's quiet zone?"* So we build our own small 3D world:

- every building is a stack of **floors** (boxes)
- click a building → it **opens**: the floors move apart, the rooms appear as markers
- search *"library"* → the right building opens and the room lights up
- **🚶 Street view** – stand on the path at eye height and look around
- **🥽 VR** – put on a headset and stand in the campus at real size

We use **three.js** – the most popular 3D library for the web – through **React Three Fiber**, which lets us write 3D scenes as React components:

| three.js idea | React Three Fiber |
|---|---|
| a 3D object | `<mesh>` |
| its shape | `<boxGeometry args={[width, height, depth]} />` |
| its surface (colour, transparency) | `<meshStandardMaterial color="blue" />` |
| a group you can move together | `<group position={[x, y, z]}>` |
| light | `<ambientLight />`, `<directionalLight />` |

**Coordinates:** `x` = left/right, `y` = **up**, `z` = towards you. 1 unit = 1 metre.

---

# Part AA – The 3D campus

## AA1. Install the 3D libraries

Stop the app (**Control + C**). In the **root** folder:

```bash
npm install three @react-three/fiber @react-three/drei @react-three/xr -w client
```

- **three** – the 3D engine (draws with WebGL on your graphics card)
- **@react-three/fiber** – three.js as React components
- **@react-three/drei** – ready-made helpers, e.g. `OrbitControls` (drag to turn, scroll to zoom)
- **@react-three/xr** – VR and AR (WebXR)

Replace **`client/vite.config.js`** with (new: `'three'` in `dedupe`, so only one copy of three.js is loaded):

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Always use one copy of React (prevents "Invalid hook call") and of three.js
  resolve: { dedupe: ['react', 'react-dom', 'three'] },
  // MapLibre loads its web worker relative to its own file; pre-bundling breaks that
  optimizeDeps: { exclude: ['maplibre-gl'] },
  server: {
    port: 5173,
    // Forward /api/* calls to the Express server
    proxy: { '/api': 'http://localhost:3001' },
  },
});
```

## AA2. ✍️ The campus as data

Create the folder **`client/src/data`** and in it **`client/src/data/campus.js`**:

```js
// A DEMO campus – replace it with your own! (Bonus exercise: measure your real campus.)
// Units are metres. position = centre of the building on the ground [x, z].
// size = [width, depth]. floors = number of floors. Each room sits on one floor at [x, z] INSIDE the building.

export const FLOOR_HEIGHT = 3.2; // metres per floor

export const CAMPUS = {
  name: 'Demo Campus',
  buildings: [
    {
      id: 'A',
      name: 'Building A – Main',
      color: '#4361ee',
      position: [0, 0],
      size: [24, 14],
      floors: 4,
      rooms: [
        { name: 'Reception', floor: 0, at: [-8, 3] },
        { name: 'Student Office', floor: 0, at: [6, -3] },
        { name: 'Lecture Hall A1', floor: 1, at: [-5, 0] },
        { name: 'Room A2.10', floor: 2, at: [7, 2] },
        { name: 'Room A2.14 (App Dev)', floor: 2, at: [-7, -3] },
        { name: 'Dean’s Office', floor: 3, at: [0, 0] },
      ],
    },
    {
      id: 'L',
      name: 'Library',
      color: '#2a9d8f',
      position: [30, -6],
      size: [14, 14],
      floors: 3,
      rooms: [
        { name: 'Book Loan', floor: 0, at: [0, 4] },
        { name: 'Quiet Study Zone', floor: 1, at: [-3, -2] },
        { name: 'Group Rooms', floor: 2, at: [3, 2] },
      ],
    },
    {
      id: 'C',
      name: 'Labs & Makerspace',
      color: '#e76f51',
      position: [-28, -6],
      size: [16, 10],
      floors: 2,
      rooms: [
        { name: 'Computer Lab C1', floor: 0, at: [-4, 0] },
        { name: '3D Printing', floor: 0, at: [4, 2] },
        { name: 'VR Lab', floor: 1, at: [0, -2] },
      ],
    },
    {
      id: 'M',
      name: 'Cafeteria',
      color: '#f4a261',
      position: [6, 24],
      size: [18, 10],
      floors: 1,
      rooms: [{ name: 'Mensa', floor: 0, at: [0, 0] }],
    },
  ],
};

// Every room with its building – handy for the search box
export const ALL_ROOMS = CAMPUS.buildings.flatMap((b) =>
  b.rooms.map((room) => ({ ...room, building: b }))
);
```

The whole campus is **just data**: buildings with a position, a size, a number of floors and rooms. The 3D code draws whatever is in this file. To show **your** campus, you only change this file (bonus exercise A).

`ALL_ROOMS` puts every room in one list, together with its building – that makes the search easy.

## AA3. ✍️ The 3D scene

Create **`client/src/components/CampusScene.jsx`**:

```jsx
// Everything inside the 3D world: ground, buildings, floors, rooms and labels.
// React Three Fiber lets us write three.js scenes as React components:
//   <mesh> = an object, <boxGeometry> = its shape, <meshStandardMaterial> = its surface.
import { useMemo } from 'react';
import * as THREE from 'three';
import { CAMPUS, FLOOR_HEIGHT } from '../data/campus.js';

const GAP = 2.5; // extra space between floors when a building is "opened"

// A text label that always faces the camera. We draw the text on a small canvas
// and use it as a picture (texture) – this works everywhere, also in VR.
function Label({ text, position, size = 1, color = '#1d1d1f' }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 48px system-ui, sans-serif';
    canvas.width = ctx.measureText(text).width + 40;
    canvas.height = 72;
    ctx.font = 'bold 48px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.roundRect(0, 0, canvas.width, canvas.height, 20);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 20, canvas.height / 2);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text, color]);

  const aspect = texture.image.width / texture.image.height;
  return (
    <sprite position={position} scale={[size * aspect, size, 1]}>
      <spriteMaterial map={texture} depthTest={false} toneMapped={false} />
    </sprite>
  );
}

// Height (y) of the floor's bottom – opened buildings spread their floors apart
const floorY = (floor, open) => floor * (FLOOR_HEIGHT + (open ? GAP : 0));

function Building({ building, open, selectedRoom, onSelect }) {
  const [x, z] = building.position;
  const [w, d] = building.size;
  const floors = Array.from({ length: building.floors }, (_, i) => i);
  const roofY = floorY(building.floors, open);

  return (
    <group position={[x, 0, z]}>
      {floors.map((floor) => (
        <mesh
          key={floor}
          position={[0, floorY(floor, open) + FLOOR_HEIGHT / 2, 0]}
          onClick={(e) => { e.stopPropagation(); onSelect(building.id); }}
        >
          <boxGeometry args={[w, FLOOR_HEIGHT * 0.94, d]} />
          <meshStandardMaterial color={building.color} transparent opacity={open ? 0.35 : 0.95} />
        </mesh>
      ))}

      {/* Rooms are only shown when the building is open */}
      {open &&
        building.rooms.map((room) => {
          const active = selectedRoom === room.name;
          const y = floorY(room.floor, true) + 1;
          return (
            <group key={room.name} position={[room.at[0], y, room.at[1]]}>
              <mesh>
                <sphereGeometry args={[active ? 0.9 : 0.5, 24, 24]} />
                <meshStandardMaterial color={active ? '#ffd60a' : '#ffffff'} emissive={active ? '#ffb703' : '#000000'} />
              </mesh>
              <Label text={room.name} position={[0, 1.6, 0]} size={active ? 2 : 1.4} />
            </group>
          );
        })}

      <Label text={building.name} position={[0, roofY + 2.5, 0]} size={2.6} color={building.color} />
    </group>
  );
}

export default function CampusScene({ openId, selectedRoom, onSelect }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[40, 60, 20]} intensity={1.2} />

      {/* Grass and a main path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={() => onSelect(null)}>
        <planeGeometry args={[160, 120]} />
        <meshStandardMaterial color="#a7c957" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 12]}>
        <planeGeometry args={[90, 4]} />
        <meshStandardMaterial color="#e9edc9" />
      </mesh>

      {CAMPUS.buildings.map((b) => (
        <Building key={b.id} building={b} open={openId === b.id} selectedRoom={selectedRoom} onSelect={onSelect} />
      ))}
    </>
  );
}
```

- **`Building`** draws one box per floor. `floorY` calculates how high a floor sits – when the building is **open**, there is extra space (`GAP`) between the floors, and the boxes become see-through (`opacity: 0.35`)
- the **rooms** of an open building are spheres; the selected one is bigger and yellow
- **`Label`** – 3D text is tricky, so we draw the text on a small invisible `<canvas>` and stick it on a **sprite** (a flat picture that always faces you). This also works in VR.
- `onClick` on a floor → `onSelect(building.id)`; a click on the grass closes it again. `e.stopPropagation()` stops the click from also reaching the grass behind the building.

## AA4. ✍️ The campus page

Create **`client/src/pages/CampusPage.jsx`**:

```jsx
import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { XR, XROrigin, createXRStore } from '@react-three/xr';
import CampusScene from '../components/CampusScene.jsx';
import { ALL_ROOMS, CAMPUS } from '../data/campus.js';

// The XR store controls the VR session (enter / exit VR)
const xrStore = createXRStore();

// Two camera views: from above, and standing on the path at eye height (1.7 m)
const VIEWS = {
  above: { position: [55, 45, 55], target: [0, 0, 0] },
  street: { position: [-48, 1.7, 12], target: [0, 5, 4] },
};

export default function CampusPage() {
  const [openId, setOpenId] = useState(null);         // which building is opened (floors apart)
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [search, setSearch] = useState('');
  const [vrSupported, setVrSupported] = useState(false);
  const controlsRef = useRef(null); // the OrbitControls, so buttons can move the camera

  // Can this device show VR? (Meta Quest browser, Android Chrome with a viewer, …)
  useEffect(() => {
    navigator.xr?.isSessionSupported('immersive-vr').then(setVrSupported).catch(() => {});
  }, []);

  const setView = (name) => {
    const controls = controlsRef.current;
    controls.object.position.set(...VIEWS[name].position);
    controls.target.set(...VIEWS[name].target);
    controls.update();
  };

  const enterVR = () => {
    if (vrSupported) xrStore.enterVR();
    else alert('This device cannot show VR. Open the page in a VR headset browser (e.g. Meta Quest) or try the street view.');
  };

  const openBuilding = (id) => {
    setOpenId(id);
    setSelectedRoom(null);
  };

  const showRoom = (room) => {
    setOpenId(room.building.id);
    setSelectedRoom(room.name);
  };

  const q = search.trim().toLowerCase();
  const results = q ? ALL_ROOMS.filter((r) => r.name.toLowerCase().includes(q) || r.building.name.toLowerCase().includes(q)) : [];
  const open = CAMPUS.buildings.find((b) => b.id === openId);

  return (
    <div className="campus-layout">
      <aside className="panel">
        <h2>🏫 {CAMPUS.name}</h2>
        <p className="hint">Drag to turn, scroll to zoom. Click a building to open it.</p>

        <input
          className="campus-search"
          placeholder="Find a room, e.g. library or A2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {q && (
          <ul className="list">
            {results.map((r) => (
              <li key={r.name} className="link" onClick={() => showRoom(r)}>
                <span>{r.name}</span>
                <span className="hint">{r.building.id} · floor {r.floor}</span>
              </li>
            ))}
            {results.length === 0 && <li className="hint">No room found</li>}
          </ul>
        )}

        <h3>Buildings</h3>
        <div className="buttons">
          {CAMPUS.buildings.map((b) => (
            <button key={b.id} className={openId === b.id ? '' : 'ghost'} onClick={() => openBuilding(openId === b.id ? null : b.id)}>
              {b.name}
            </button>
          ))}
        </div>

        {open && (
          <div className="card campus-floors">
            <h3>{open.name}</h3>
            {Array.from({ length: open.floors }, (_, f) => open.floors - 1 - f).map((floor) => (
              <div key={floor}>
                <b>Floor {floor}</b>
                {open.rooms.filter((r) => r.floor === floor).map((r) => (
                  <div key={r.name} className={`link campus-room ${selectedRoom === r.name ? 'active' : ''}`}
                       onClick={() => showRoom({ ...r, building: open })}>
                    📍 {r.name}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="campus-views">
          <button className="ghost" onClick={() => setView('above')}>🛰️ From above</button>
          <button className="ghost" onClick={() => setView('street')}>🚶 Street view</button>
          <button onClick={enterVR}>🥽 Enter VR</button>
        </div>
        <p className="hint">
          {vrSupported
            ? 'In VR you stand in the middle of the campus, at real size. Look around!'
            : 'VR works in a VR headset browser (e.g. Meta Quest). On this device: try the street view and drag to look around.'}
        </p>
      </aside>

      <div className="campus-canvas">
        <Canvas camera={{ position: VIEWS.above.position, fov: 45 }}>
          <XR store={xrStore}>
            {/* Where you stand in VR: on the path, between the buildings */}
            <XROrigin position={[-48, 0, 12]} rotation={[0, -Math.PI / 2, 0]} />
            <CampusScene openId={openId} selectedRoom={selectedRoom} onSelect={openBuilding} />
          </XR>
          <OrbitControls ref={controlsRef} makeDefault maxPolarAngle={Math.PI / 2.05} />
        </Canvas>
      </div>
    </div>
  );
}
```

- **`<Canvas>`** – the 3D area. Everything inside it is 3D; everything outside (the panel) is normal HTML.
- **`<OrbitControls>`** – drag to turn, scroll to zoom. `maxPolarAngle` stops the camera from going under the ground.
- **`VIEWS`** + `setView` – the buttons move the camera: from above, or standing on the path at **1.7 m** (eye height)
- **search** – filters `ALL_ROOMS` while you type; clicking a result opens the building and highlights the room
- **VR**:
  - `createXRStore()` – controls the VR session; `xrStore.enterVR()` starts it
  - `<XR store={xrStore}>` – the part of the scene that is visible in VR
  - `<XROrigin>` – where **you** stand in VR: at the start of the path, at real size
  - `navigator.xr.isSessionSupported('immersive-vr')` – asks the browser *"can you show VR?"*

## AA5. ✍️ Add the page to the menu

Replace **`client/src/App.jsx`** with:

```jsx
import { lazy, Suspense, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';
import LoginPage from './pages/LoginPage.jsx';
import MapPage from './pages/MapPage.jsx';
import CalendarPage from './pages/CalendarPage.jsx';

// The 3D campus is big (three.js) – load it only when someone opens the page
const CampusPage = lazy(() => import('./pages/CampusPage.jsx'));

const PAGES = {
  map: { label: '🗺️ 3D Map', component: MapPage },
  calendar: { label: '📅 AI Calendar', component: CalendarPage },
  campus: { label: '🏫 Campus 3D', component: CampusPage },
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
        <Suspense fallback={<p className="hint" style={{ padding: 20 }}>Loading…</p>}>
          <Page />
        </Suspense>
      </main>
    </div>
  );
}
```

New: **`lazy(() => import('./pages/CampusPage.jsx'))`** and **`<Suspense>`**. three.js is big (about 1 MB). With `lazy`, the browser downloads it **only when someone opens the Campus page** – the login and calendar stay fast. `<Suspense fallback=…>` shows *"Loading…"* while it downloads.

Add these styles **at the end** of **`client/src/index.css`**:

```css
/* Campus 3D page (step 10) */
.campus-layout { display: flex; height: 100%; }
.campus-layout .panel { width: 320px; display: flex; flex-direction: column; gap: 10px; }
.campus-layout h2, .campus-layout h3 { margin: 0; }
.campus-search { width: 100%; }
.campus-canvas { flex: 1; background: #dbe7f3; }
.campus-floors { display: flex; flex-direction: column; gap: 8px; }
.campus-room { padding: 2px 0 2px 8px; }
.campus-room.active { font-weight: 700; background: #fff3cd; border-radius: 4px; }
.campus-views { margin-top: auto; display: flex; flex-wrap: wrap; gap: 6px; }
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

/* Campus 3D page (step 10) */
.campus-layout { display: flex; height: 100%; }
.campus-layout .panel { width: 320px; display: flex; flex-direction: column; gap: 10px; }
.campus-layout h2, .campus-layout h3 { margin: 0; }
.campus-search { width: 100%; }
.campus-canvas { flex: 1; background: #dbe7f3; }
.campus-floors { display: flex; flex-direction: column; gap: 8px; }
.campus-room { padding: 2px 0 2px 8px; }
.campus-room.active { font-weight: 700; background: #fff3cd; border-radius: 4px; }
.campus-views { margin-top: auto; display: flex; flex-wrap: wrap; gap: 6px; }
```
</details>

## AA6. 👀 Explore it

`npm run dev` → log in → **🏫 Campus 3D**.

1. Drag to turn the campus, scroll to zoom.
2. Click **Library** → the floors move apart, three rooms appear, the panel lists them by floor.
3. Type **`A2`** in the search → click **Room A2.14 (App Dev)** → Building A opens, the room glows yellow.
4. **🚶 Street view** → you stand at the start of the path. Drag to look around.
5. Click the grass → the building closes.

---

# Part AB – VR

## 💡 How VR works in the browser

**WebXR** is a browser feature for VR (and AR). The page asks *"can you show VR?"*; if yes, `enterVR()` switches the headset into VR and three.js draws the scene twice – once per eye.

| Device | VR? |
|---|---|
| **Meta Quest** (browser) | ✅ best experience |
| **Android phone** with Chrome + a cardboard viewer | ✅ |
| iPhone (Safari) | ❌ no WebXR – use the street view |
| Laptop | ❌ (no headset) – the button explains this |

## AB1. 🥽 Try it on a headset

The headset must open your page **online** – `localhost` only exists on your laptop.

1. Push your code (Lesson 7) → Vercel builds it → open your link in the **Meta Quest browser** (or Android Chrome).
2. Log in → **🏫 Campus 3D** → **🥽 Enter VR**.
3. You stand at the start of the path. Look around – the buildings are at **real size**.

> No headset in class? Pass one around, or use the street view – the scene is the same.

---

# 🎉 You built a 3D campus!

## 🛠️ Troubleshooting

| You see | Fix |
|---|---|
| The 3D area stays empty / white | update your browser; in Chrome check `chrome://gpu` → *WebGL: Hardware accelerated* |
| *"WARNING: Multiple instances of Three.js"* in the console | add `'three'` to `dedupe` in `vite.config.js` (AA1), restart `npm run dev` |
| **Enter VR** says *"This device cannot show VR"* | correct on a laptop or iPhone – open the online version on a headset (AB1) |
| The page loads slowly the first time | three.js is downloading (~1 MB, only once) |

## 💪 Bonus exercises

**A.** **Your real campus:** measure your campus buildings (Google Maps → right click → *Measure distance*), and replace the buildings and rooms in `campus.js`. Nothing else has to change!

**B.** Give each room a **description** (opening hours, who sits there) and show it in the panel when it is selected.

**C.** Move the camera to the opened building automatically. *(Hint: `controlsRef.current.target.set(x, 5, z)` in `openBuilding`.)*

**D.** Save "favourite rooms" in the database – like the places on the map (Lesson 2 and 6).

## 📖 Words you learned

| Word | Meaning |
|---|---|
| **three.js** | JavaScript library for 3D graphics in the browser |
| **WebGL** | the browser feature that draws 3D with the graphics card |
| **Mesh / geometry / material** | a 3D object / its shape / its surface |
| **Scene, camera, light** | the world, the eye that looks at it, what makes it visible |
| **Sprite** | a flat picture in 3D that always faces the camera |
| **WebXR** | the browser feature for VR and AR |
| **Lazy loading** | download code only when it is needed |
