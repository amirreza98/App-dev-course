import { Router } from 'express';

const router = Router();

// In-memory "database" — resets when the server restarts.
// Next level: replace this array with a real database (MongoDB / PostgreSQL).
let tasks = [];
let nextId = 1;

// GET /api/tasks -> list all tasks
router.get('/', (req, res) => res.json(tasks));

// POST /api/tasks -> create a task. Body: { title, deadline, hours }
router.post('/', (req, res) => {
  const { title, deadline, hours } = req.body;
  if (!title || !deadline || !hours) {
    return res.status(400).json({ error: 'title, deadline and hours are required' });
  }
  const task = { id: nextId++, title, deadline, hours: Number(hours) };
  tasks.push(task);
  res.status(201).json(task);
});

// DELETE /api/tasks/:id -> remove a task
router.delete('/:id', (req, res) => {
  tasks = tasks.filter((t) => t.id !== Number(req.params.id));
  res.status(204).end();
});

export default router;
