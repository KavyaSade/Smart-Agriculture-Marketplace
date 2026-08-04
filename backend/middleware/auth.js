import jwt from 'jsonwebtoken';

/**
 * Express middleware to verify the incoming JSON Web Token (JWT) and attach the decoded user info to req.user.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Access token required. Please log in.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_agri_market_2026', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Session expired or invalid token. Please log in again.' });
    }
    
    req.user = user; // Contains id, email, role
    next();
  });
}
