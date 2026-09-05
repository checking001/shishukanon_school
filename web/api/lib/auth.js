import jwt from 'jsonwebtoken';

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET environment variable missing');
  return s;
}

export function signToken(payload) {
  return jwt.sign(payload, secret(), { expiresIn: '12h' });
}

// Verifies the Authorization: Bearer <token> header on an incoming request.
// On success returns the decoded payload. On failure it writes a 401
// response itself and returns null — callers just do:
//   const user = requireAuth(req, res); if (!user) return;
export function requireAuth(req, res) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'লগইন প্রয়োজন' });
    return null;
  }
  try {
    return jwt.verify(token, secret());
  } catch {
    res.status(401).json({ error: 'সেশনের মেয়াদ শেষ হয়ে গেছে, আবার লগইন করুন' });
    return null;
  }
}
