const jwt = require('jsonwebtoken');
const logger = require('../../logger/logger');
const Response = require('../../../responses/EcomResponseManager');
const { JWTConfig: JWT_CONFIG } = require('../../config/ConfigManager');

const JWTService = {
  // Generate a new token (access or refresh)
  getToken: (payload, type = 'access') => {
    const options = {
      expiresIn: type === 'access' ? JWT_CONFIG.jwt.tokenExpiry : JWT_CONFIG.jwt.refreshTokenExpiry,
      issuer: JWT_CONFIG.jwt.issuer,
      audience: JWT_CONFIG.jwt.audience,
    };

    try {
      const token = jwt.sign(payload, JWT_CONFIG.jwt.secret, options);
      return {
        status: 200,
        data: {
          token,
          expiresIn: options.expiresIn,
          tokenType: type,
        }
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error generating token',
        error: error.message
      };
    }
  },

  // Verify an existing JWT (also with role-based validation if required)
  verifyToken: (token, expectedRole = null) => {
    try {
      const decoded = jwt.verify(token, JWT_CONFIG.jwt.secret, {
        issuer: JWT_CONFIG.jwt.issuer,
        audience: JWT_CONFIG.jwt.audience,
      });

      if (expectedRole && decoded.role !== expectedRole) {
        throw new Error(`Token role mismatch. Expected: ${expectedRole}, Received: ${decoded.role}`);
      }

      return {
        status: 200,
        data: decoded,
      };
    } catch (error) {
      return {
        status: 401,
        message: 'Invalid token',
        error: error.message,
      };
    }
  },

  // Refresh an existing token (typically access token)
  refreshToken: (token) => {
    const { status, data: decoded } = JWTService.verifyToken(token);
    if (status !== 200) {
      throw new Error('Invalid token, cannot refresh');
    }

    // Remove exp and iat to create a new token (access token)
    const { exp, iat, ...payload } = decoded;
    return JWTService.getToken(payload, 'access'); // Generate a new access token
  },

  // Revoke a token (This usually involves blacklisting the token in a real-world scenario)
  revokeToken: (token) => {
    // Implement token blacklist logic here if needed
    logger.info('Token revoked successfully');
    return Response.success.Ok.json({ message: 'Token revoked successfully' });
  },

  // Generate an access token explicitly
  generateAccessToken: (payload) => {
    return JWTService.getToken(payload, 'access');
  },

  // Generate a refresh token explicitly
  generateRefreshToken: (payload) => {
    return JWTService.getToken(payload, 'refresh');
  },
};

module.exports = JWTService;
