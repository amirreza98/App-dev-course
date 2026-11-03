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
