import jwt from 'jsonwebtoken';

// Create a token that proves "this is user 7". It is valid for 7 days.
export function createToken(user) {
  return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Middleware: runs BEFORE a route. Lets the request through only with a valid token.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';      // "Bearer eyJhbGciOi..."
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please log in' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET); // throws if fake or expired
    req.userId = payload.userId;                                // the routes use this
    next();                                                     // continue to the route
  } catch {
    res.status(401).json({ error: 'Your session expired, please log in again' });
  }
}
