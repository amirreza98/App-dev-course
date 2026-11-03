import pg from 'pg';

// Locally, settings come from server/.env. On Vercel they come from the project's
// "Environment Variables" – there is no .env file there, and that's fine.
try { process.loadEnvFile(); } catch { /* no .env file */ }

// Which required settings are missing? (empty list = all good)
export const missingSettings = () => ['DATABASE_URL', 'JWT_SECRET'].filter((name) => !process.env[name]);

// Return DATE columns as plain 'YYYY-MM-DD' text (not JavaScript Date objects)
pg.types.setTypeParser(1082, (value) => value);

// A pool keeps a few connections open and reuses them for every query
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Create the tables once. On Vercel the server starts again and again,
// so we remember the result and only do it the first time.
let ready = null;
export function initDb() {
  if (!ready) ready = createTables().catch((err) => { ready = null; throw err; });
  return ready;
}

async function createTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS places (
      id   SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      lng  DOUBLE PRECISION NOT NULL,
      lat  DOUBLE PRECISION NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id       SERIAL PRIMARY KEY,
      title    TEXT NOT NULL,
      deadline DATE NOT NULL,
      hours    REAL NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      done     BOOLEAN NOT NULL DEFAULT false
    );

    -- Every place and task now belongs to one user
    ALTER TABLE places ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    ALTER TABLE tasks  ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
  `);
  console.log('✅ Database ready');
}
