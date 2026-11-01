import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// GET /api/places -> all saved places
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM places ORDER BY id');
  res.json(result.rows);
});

// POST /api/places -> save a new place. Body: { name, lng, lat }
router.post('/', async (req, res) => {
  const { name, lng, lat } = req.body;
  if (!name || lng == null || lat == null) {
    return res.status(400).json({ error: 'name, lng and lat are required' });
  }
  const result = await pool.query(
    'INSERT INTO places (name, lng, lat) VALUES ($1, $2, $3) RETURNING *',
    [name, Number(lng), Number(lat)]
  );
  res.status(201).json(result.rows[0]);
});

// DELETE /api/places/:id -> remove a place
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM places WHERE id = $1', [Number(req.params.id)]);
  res.status(204).end();
});

export default router;
