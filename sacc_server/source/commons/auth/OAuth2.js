const fetch = require("node-fetch");
const logger = require("../logger/logger");
const Response = require('../responses/EcomResponseManager');
const HydraClient = require('./provider/HydraClient');

function OAuth2() { }

OAuth2.prototype.getAccessToken = async function (userId = '') {
  let accessToken = {};

  try {
    await HydraClient.ensureClient();
  
    const authorizationURI = await HydraClient.getAuthorizationURI();
    console.log("-----------------authorizationURI=====",authorizationURI);
    const initiateCheckin  = await fetch(authorizationURI, { redirect: 'manual' });
    
    accessToken = await HydraClient.getAccessToken(initiateCheckin, userId);

  } catch (e) {
    console.log("======================",e);
    logger.error(e.message);
    return Response.error.InternalError.json();
  }
    
  return accessToken;
}

OAuth2.prototype.refreshAccessToken = async function(tokenObj, userId) {
  let newToken = {};

  try {
    newToken = await HydraClient.refreshAccessToken(tokenObj);
  } catch (e) {
    newToken = await (new OAuth2).getAccessToken(userId);
  }

  return newToken;
}
OAuth2.prototype.revokeAccessToken  = HydraClient.revokeAccessToken;

module.exports = new OAuth2();