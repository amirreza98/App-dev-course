import { Router } from 'express';
import { pool } from '../db.js';
import { planTasks } from '../planner.js';

const router = Router();

const COLORS = ['#4361ee', '#e63946', '#2a9d8f', '#f4a261', '#9b5de5', '#06aed5', '#e76f51', '#588157'];
const PRIORITIES = ['low', 'medium', 'high'];

// The colour is not stored in the database: we calculate it from the id
const withColor = (task) => ({ ...task, color: COLORS[(task.id - 1) % COLORS.length] });

// Every query uses req.userId (set by requireAuth), so users only see their own tasks

// GET /api/tasks -> list my tasks
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY deadline, id', [req.userId]);
  res.json(result.rows.map(withColor));
});

// POST /api/tasks -> create a task. Body: { title, deadline, hours, priority }
router.post('/', async (req, res) => {
  const { title, deadline, hours, priority = 'medium' } = req.body;
  if (!title || !deadline || !hours) {
    return res.status(400).json({ error: 'title, deadline and hours are required' });
  }
  const result = await pool.query(
    `INSERT INTO tasks (title, deadline, hours, priority, user_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [title, deadline, Number(hours), PRIORITIES.includes(priority) ? priority : 'medium', req.userId]
  );
  res.status(201).json(withColor(result.rows[0]));
});

// PATCH /api/tasks/:id -> change some fields, e.g. { done: true } or { priority: 'high' }
router.patch('/:id', async (req, res) => {
  const { title, deadline, hours, priority, done } = req.body;
  // COALESCE(new, old): keep the old value when a field is not sent
  const result = await pool.query(
    `UPDATE tasks SET
       title    = COALESCE($1, title),
       deadline = COALESCE($2, deadline),
       hours    = COALESCE($3, hours),
       priority = COALESCE($4, priority),
       done     = COALESCE($5, done)
     WHERE id = $6 AND user_id = $7
     RETURNING *`,
    [
      title ?? null,
      deadline ?? null,
      hours !== undefined ? Number(hours) : null,
      PRIORITIES.includes(priority) ? priority : null,
      done !== undefined ? Boolean(done) : null,
      Number(req.params.id),
      req.userId,
    ]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
  res.json(withColor(result.rows[0]));
});

// DELETE /api/tasks/:id -> remove a task
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [Number(req.params.id), req.userId]);
  res.status(204).end();
});

// POST /api/tasks/plan -> build a schedule that spreads work out BEFORE the deadline.
// Body: { maxHoursPerDay, useAi, today: 'YYYY-MM-DD' }
router.post('/plan', async (req, res) => {
  const maxHoursPerDay = Number(req.body?.maxHoursPerDay) || 4;
  const useAi = Boolean(req.body?.useAi);
  const today = /^\d{4}-\d{2}-\d{2}$/.test(req.body?.today) ? req.body.today : undefined;
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE done = false AND user_id = $1', [req.userId]);
    const plan = await planTasks(result.rows.map(withColor), { maxHoursPerDay, useAi, today });
    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Planning failed' });
  }
});

export default router;
