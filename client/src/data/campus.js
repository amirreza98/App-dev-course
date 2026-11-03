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
