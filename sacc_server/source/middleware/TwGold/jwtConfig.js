const jwt = require('jsonwebtoken');

const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'fehfwedneod',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
};

// Generate token
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    JWT_CONFIG.secret,
    { expiresIn: JWT_CONFIG.expiresIn }
  );
};

// Verify token
const verifyToken = (token) => {
  return jwt.verify(token, JWT_CONFIG.secret);
};

module.exports = {
  JWT_CONFIG,
  generateToken,
  verifyToken
};