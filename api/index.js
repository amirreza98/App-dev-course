// Vercel turns every file in the api/ folder into a serverless function.
// This one simply hands every /api/... request to our Express app.
import app from '../server/src/app.js';

export default app;
