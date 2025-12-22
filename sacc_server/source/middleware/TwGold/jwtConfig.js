const jwt = require('jsonwebtoken');

const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'fehfwedneod',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
};

// Generate token with enhanced claims
const generateToken = (userId, role, department, branch) => {
  return jwt.sign(
    { 
      id: userId, 
      role,
      department,
      branch,
      type: 'access'
    },
    JWT_CONFIG.secret,
    { expiresIn: JWT_CONFIG.expiresIn }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { 
      id: userId,
      type: 'refresh'
    },
    JWT_CONFIG.secret,
    { expiresIn: '30d' }
  );
};

// Verify token
const verifyToken = (token) => {
  return jwt.verify(token, JWT_CONFIG.secret);
};

// Decode token without verification
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  JWT_CONFIG,
  generateToken,
  generateRefreshToken,
  verifyToken,
  decodeToken
};