// Local development: check the settings, prepare the database, start listening.
import app from './app.js';
import { initDb, missingSettings } from './db.js';

const missing = missingSettings();
if (missing.length) {
  console.error(`❌ Missing in server/.env: ${missing.join(', ')} (see server/.env.example)`);
  process.exit(1);
}

try {
  await initDb();
} catch (err) {
  console.error('❌ Could not connect to the database. Check DATABASE_URL in server/.env');
  console.error(err.message);
  process.exit(1);
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
