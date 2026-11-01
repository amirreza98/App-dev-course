import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// Every query uses req.userId (set by requireAuth), so users only see their own places

// GET /api/places -> my saved places
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM places WHERE user_id = $1 ORDER BY id', [req.userId]);
  res.json(result.rows);
});

// POST /api/places -> save a new place. Body: { name, lng, lat }
router.post('/', async (req, res) => {
  const { name, lng, lat } = req.body;
  if (!name || lng == null || lat == null) {
    return res.status(400).json({ error: 'name, lng and lat are required' });
  }
  const result = await pool.query(
    'INSERT INTO places (name, lng, lat, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, Number(lng), Number(lat), req.userId]
  );
  res.status(201).json(result.rows[0]);
});

// DELETE /api/places/:id -> remove one of MY places
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM places WHERE id = $1 AND user_id = $2', [Number(req.params.id), req.userId]);
  res.status(204).end();
});

export default router;
