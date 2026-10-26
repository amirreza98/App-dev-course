import { Router } from 'express';
import { planTasks } from '../planner.js';

const router = Router();

const COLORS = ['#4361ee', '#e63946', '#2a9d8f', '#f4a261', '#9b5de5', '#06aed5', '#e76f51', '#588157'];
const PRIORITIES = ['low', 'medium', 'high'];

// In-memory "database" — resets when the server restarts.
// Next level: replace this array with a real database (MongoDB / PostgreSQL).
let tasks = [];
let nextId = 1;

// GET /api/tasks -> list all tasks
router.get('/', (req, res) => res.json(tasks));

// POST /api/tasks -> create a task. Body: { title, deadline, hours, priority }
router.post('/', (req, res) => {
  const { title, deadline, hours, priority = 'medium' } = req.body;
  if (!title || !deadline || !hours) {
    return res.status(400).json({ error: 'title, deadline and hours are required' });
  }
  const id = nextId++;
  const task = {
    id,
    title,
    deadline,
    hours: Number(hours),
    priority: PRIORITIES.includes(priority) ? priority : 'medium',
    color: COLORS[(id - 1) % COLORS.length],
    done: false,
  };
  tasks.push(task);
  res.status(201).json(task);
});

// PATCH /api/tasks/:id -> change some fields, e.g. { done: true } or { priority: 'high' }
router.patch('/:id', (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const { title, deadline, hours, priority, done } = req.body;
  if (title !== undefined) task.title = title;
  if (deadline !== undefined) task.deadline = deadline;
  if (hours !== undefined) task.hours = Number(hours);
  if (PRIORITIES.includes(priority)) task.priority = priority;
  if (done !== undefined) task.done = Boolean(done);
  res.json(task);
});

// DELETE /api/tasks/:id -> remove a task
router.delete('/:id', (req, res) => {
  tasks = tasks.filter((t) => t.id !== Number(req.params.id));
  res.status(204).end();
});

// POST /api/tasks/plan -> build a schedule that spreads work out BEFORE the deadline.
// Body: { maxHoursPerDay, useAi, today: 'YYYY-MM-DD' }
router.post('/plan', async (req, res) => {
  const maxHoursPerDay = Number(req.body?.maxHoursPerDay) || 4;
  const useAi = Boolean(req.body?.useAi);
  const today = /^\d{4}-\d{2}-\d{2}$/.test(req.body?.today) ? req.body.today : undefined;
  try {
    const open = tasks.filter((t) => !t.done);
    const plan = await planTasks(open, { maxHoursPerDay, useAi, today });
    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Planning failed' });
  }
});

export default router;
