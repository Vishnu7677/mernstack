const jwt = require('jsonwebtoken');
const TWgoldUser = require('../../commons/models/mongo/documents/TwGoldUser');

const { verifyToken } = require('./jwtConfig'); 

const twgold_authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                 req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    const decoded = verifyToken(token);
    
    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type.',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    const user = await TWgoldUser.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. User not found.',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token signature.',
        code: 'INVALID_TOKEN_SIGNATURE'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed.',
      code: 'AUTH_FAILED'
    });
  }
};

const twgold_requireRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.',
          code: 'AUTH_REQUIRED'
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.',
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredRoles: roles,
          userRole: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Role verification failed.',
        code: 'ROLE_VERIFICATION_FAILED'
      });
    }
  };
};

// Permission check middleware
const twgold_checkPermission = (module, access = 'read') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.',
          code: 'AUTH_REQUIRED'
        });
      }

      if (!req.user.hasPermission(module, access)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions for this action.',
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredPermission: { module, access },
          userPermissions: req.user.permissions
        });
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Permission verification failed.',
        code: 'PERMISSION_VERIFICATION_FAILED'
      });
    }
  };
};

// Scope check middleware
const twgold_checkScope = (requiredScope) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.',
          code: 'AUTH_REQUIRED'
        });
      }
      // 🔥 ADMIN = ALL SCOPES
      if (req.user.role === 'admin') return next();

      // Implementation depends on your scope logic
      const userPermissions = req.user.permissions || [];
      const hasScope = userPermissions.some(perm => 
        perm.scope === requiredScope || perm.scope === 'all'
      );

      if (!hasScope) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient scope for this action.',
          code: 'INSUFFICIENT_SCOPE',
          requiredScope,
          userScopes: userPermissions.map(p => p.scope)
        });
      }

      next();
    } catch (error) {
      console.error('Scope middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Scope verification failed.',
        code: 'SCOPE_VERIFICATION_FAILED'
      });
    }
  };
};

module.exports = { 
  twgold_authMiddleware, 
  twgold_requireRole, 
  twgold_checkPermission,
  twgold_checkScope 
};