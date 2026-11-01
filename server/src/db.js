import pg from 'pg';

// Load server/.env (DATABASE_URL and JWT_SECRET live there)
try { process.loadEnvFile(); } catch { /* no .env file */ }

for (const name of ['DATABASE_URL', 'JWT_SECRET']) {
  if (!process.env[name]) {
    console.error(`❌ ${name} is missing. Add it to server/.env (see server/.env.example).`);
    process.exit(1);
  }
}

// Return DATE columns as plain 'YYYY-MM-DD' text (not JavaScript Date objects)
pg.types.setTypeParser(1082, (value) => value);

// A pool keeps a few connections open and reuses them for every query
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Create the tables the first time the server starts
export async function initDb() {
  try {
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
  } catch (err) {
    console.error('❌ Could not connect to the database. Check DATABASE_URL in server/.env');
    console.error(err.message);
    process.exit(1);
  }
  console.log('✅ Database ready');
}
