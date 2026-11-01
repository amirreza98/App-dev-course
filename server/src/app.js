import express from 'express';
import cors from 'cors';
import { initDb, missingSettings } from './db.js';
import { requireAuth } from './middleware/auth.js';
import authRouter from './routes/auth.js';
import placesRouter from './routes/places.js';
import tasksRouter from './routes/tasks.js';

// The Express app – WITHOUT app.listen().
// Locally index.js starts it; on Vercel, api/index.js hands it to Vercel.
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Before every other API request: settings present? tables created?
app.use('/api', async (req, res, next) => {
  const missing = missingSettings();
  if (missing.length) {
    return res.status(500).json({ error: `Server is not configured: ${missing.join(', ')} missing` });
  }
  await initDb(); // fast after the first time
  next();
});

// Login and registration – open to everyone
app.use('/api/auth', authRouter);

// Project 1: 3D Map – only for logged-in users
app.use('/api/places', requireAuth, placesRouter);

// Project 2: AI Calendar – only for logged-in users
app.use('/api/tasks', requireAuth, tasksRouter);

// If something fails, answer with a clear error instead of crashing
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

export default app;
