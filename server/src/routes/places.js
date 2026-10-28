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