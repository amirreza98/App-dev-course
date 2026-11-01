import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import { requireAuth } from './middleware/auth.js';
import authRouter from './routes/auth.js';
import placesRouter from './routes/places.js';
import tasksRouter from './routes/tasks.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Login and registration – open to everyone
app.use('/api/auth', authRouter);

// Project 1: 3D Map – only for logged-in users
app.use('/api/places', requireAuth, placesRouter);

// Project 2: AI Calendar – only for logged-in users
app.use('/api/tasks', requireAuth, tasksRouter);

// If a database query fails, answer with a clear error instead of crashing
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 3001;
await initDb();
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
