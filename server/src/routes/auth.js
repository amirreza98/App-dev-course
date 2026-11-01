import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { createToken, requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register -> create an account. Body: { email, password }
router.post('/register', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!email.includes('@')) return res.status(400).json({ error: 'Please enter a valid email' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must have at least 6 characters' });

  // Never store the password itself – only a hash of it
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, passwordHash]
    );
    const user = result.rows[0];
    // Welcome gift: one example place on the map
    await pool.query(
      'INSERT INTO places (name, lng, lat, user_id) VALUES ($1, $2, $3, $4)',
      ['Brandenburg Gate', 13.3777, 52.5163, user.id]
    );
    res.status(201).json({ token: createToken(user), user });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'This email is already registered' });
    throw err;
  }
});

// POST /api/auth/login -> check email + password. Body: { email, password }
router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  // Same message for "no such user" and "wrong password" – don't tell attackers which one
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Wrong email or password' });
  }
  res.json({ token: createToken(user), user: { id: user.id, email: user.email } });
});

// GET /api/auth/me -> who am I? (used when the page is reloaded)
router.get('/me', requireAuth, async (req, res) => {
  const result = await pool.query('SELECT id, email FROM users WHERE id = $1', [req.userId]);
  if (!result.rows[0]) return res.status(401).json({ error: 'Please log in' });
  res.json(result.rows[0]);
});

export default router;
