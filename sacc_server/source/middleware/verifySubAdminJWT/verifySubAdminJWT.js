// SubAdminJWT.js
const JWTService = require('../../commons/auth/JWTManager/JWTService');

function verifySubAdminJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; // Assuming the token is in the Authorization header as "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  const { status, data, message } = JWTService.verifyToken(token, 'subadmin'); // Expecting the role to be 'subadmin'

  if (status === 200) {
    req.user = data; // Attach decoded token data to the request
    next(); // Proceed to the next middleware/route handler
  } else {
    res.status(status).json({ message });
  }
}

module.exports = verifySubAdminJWT;
