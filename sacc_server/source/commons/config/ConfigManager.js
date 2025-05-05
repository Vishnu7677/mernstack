const API           = require('./elements/API');
const OAuth2Config  = require('./elements/OAuth2');
require('dotenv').config();

module.exports = {
  API,
  OAuth2Config,
  JWTConfig: {
    jwt: {
      secret: process.env.JWTSECRET || 'defaultSecret',
      tokenExpiry: process.env.JWT_TOKEN_EXPIRY || '1h',
      issuer: process.env.JWT_ISSUER || 'SACBank',
      audience: process.env.JWT_AUDIENCE || 'SACBankUsers',
    }
  }
}