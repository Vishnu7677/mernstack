require('dotenv').config();
const fetch      = require('node-fetch');
const logger     = require('../commons/logger/logger');
const Response   = require('../commons/responses/EcomResponseManager');
const IsExempted = require('./exemptions');
const {
  Partner,
  User
}   = require('../commons/models/mongo/mongodb');
const {
  crypto,
  url
} = require('../commons/util/UtilManager');

async function Authentication(req, res, next) {
  req.isDeveloperRequest = url.isDeveloperRequest(req.headers);

  if('production' === process.env.ENVIRONMENT && req.isDeveloperRequest) {
    res.status(Response.error.Forbidden.code).json(Response.error.Forbidden.json('Postman not allowed!'));
    return;
  }

  if (await IsExempted(req.path)) {
    next();
    return;
  }

  let rawToken = req.headers.authorization || req.headers.accesskey || req.params.accessToken || req.query.accessToken || '';
  let xApiKeyE = req.headers['x-api-key'] || '';

  if(xApiKeyE) {
    const xApiKey = crypto.public.decrypt(xApiKeyE);
    const refUser = await Partner.findOne({ _id: xApiKey });
    req.headers.accountid = refUser.userId;

  } else {
    if (req.path.startsWith('/gw/api/user/link')) {
      let relativePath = req.path.split('/gw/api/user/link');
      relativePath.shift();
  
      rawToken = relativePath[0].split('/')[2];
  
      req.params.accessToken = rawToken;
      req.params.email       = relativePath[0].split('/')[3];
    }
  
    const token = Object.freeze(rawToken);
  
    if (token) {
      try {
        let hydraResponse = await fetch(process.env.HYDRA_OAUTH2_INTROSPECT_URL, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          method: 'POST',
          body: `token=${token}`,
        });
  
        let responseObj = await hydraResponse.json();
        let { active: isActive, token_type: tokenType, sub: userId } = responseObj;
  
        if (isActive && 'access_token' === tokenType) {
          req.headers.accountid = userId;
        } else {
          return res.status(Response.error.Expired.code).json(Response.error.Expired.json('Access-Token expired!'));
        }
      } catch (e) {
        logger.error('Authentication => Failed to validate token => ', e.message);
      }
    }
  }

  const userId = req.headers.accountid;

  if (userId) {
    const userObj = (await User.aggregate([
      { $lookup: { from: "OffenseMonitor", localField: "_id", foreignField: "_id", as: "offense" } },
      { $lookup: { from: "Accounts", localField: "_id", foreignField: "_id", as: "account" } },
      { $lookup: { from: "Role", localField: "userRoleId", foreignField: "_id", as: "role" } },
      { $match: { $and: [ { "_id": userId }, ] } },
      { 
        $project: {
          _id: 1, offense: { $arrayElemAt: [ "$offense", 0 ] }, apps: 1 , createdAt: 1,
          email: 1, mobile: 1, concessionareCode: 1, userRoleId: 1, devices: 1, concessionaireStores: 1,
          role: { $arrayElemAt: [ "$role.role", 0 ] },
          firstName: { $arrayElemAt: [ "$account.firstName", 0 ] },
          lastName: { $arrayElemAt: [ "$account.lastName", 0 ] },
          fullName: { $arrayElemAt: [ "$account.fullName", 0 ] },
          nationality: { $arrayElemAt: [ "$account.nationality", 0 ] },
          country: { $arrayElemAt: [ "$account.country", 0 ] },
          city: { $arrayElemAt: [ "$account.city", 0 ] },
        }
      }
    ]).exec())[0];

    if (userObj) {
      req.user = userObj;
      return next();
    } else {
      return res.status(Response.error.Forbidden.code).json(Response.error.Forbidden.json('So, you thought spoofing your identity will get you in!! (slow claps)'));
    }
  }

  return res.status(Response.error.Forbidden.code).json(Response.error.Forbidden.json('So, you thought spoofing your identity will get you in!! (slow claps)'));
}

module.exports = Authentication;