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
