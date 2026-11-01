import pg from 'pg';

// Load server/.env (DATABASE_URL lives there)
try { process.loadEnvFile(); } catch { /* no .env file */ }

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is missing. Copy server/.env.example to server/.env and paste your Neon connection string.');
  process.exit(1);
}

// Return DATE columns as plain 'YYYY-MM-DD' text (not JavaScript Date objects)
pg.types.setTypeParser(1082, (value) => value);

// A pool keeps a few connections open and reuses them for every query
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Create the tables the first time the server starts
export async function initDb() {
  try {
    await pool.query(`
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
    `);

    // First start: add one example place so the map is not empty
    const { rows } = await pool.query('SELECT COUNT(*) FROM places');
    if (Number(rows[0].count) === 0) {
      await pool.query(
        'INSERT INTO places (name, lng, lat) VALUES ($1, $2, $3)',
        ['Brandenburg Gate', 13.3777, 52.5163]
      );
    }
  } catch (err) {
    console.error('❌ Could not connect to the database. Check DATABASE_URL in server/.env');
    console.error(err.message);
    process.exit(1);
  }
  console.log('✅ Database ready');
}
