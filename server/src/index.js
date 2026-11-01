import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import placesRouter from './routes/places.js';
import tasksRouter from './routes/tasks.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Project 1: 3D Map
app.use('/api/places', placesRouter);

// Project 2: AI Calendar
app.use('/api/tasks', tasksRouter);

// If a database query fails, answer with a clear error instead of crashing
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Database error' });
});

const PORT = process.env.PORT || 3001;
await initDb();
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
