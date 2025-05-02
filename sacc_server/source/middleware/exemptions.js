const logger = require("../commons/logger/logger");
const {
  Context
} = require('../commons/context/dbContext');

async function main(requestedPath = '') {
  try {
    const exemptedAPIs = [
      "/user/validateToReg",
      "/user/register",
      "/login/guest",
      "/login/local",
      "/login/google",
      "/login/facebook",
      "/login/generateOtp",
      "/api/admin/createAdmin",
      "/login/otp",
      "/login/reset/password"
    ]

    if (0 < exemptedAPIs.filter(x => requestedPath.startsWith(x)).length) return true;
    if (0 < exemptedAPIs.filter(x => requestedPath.endsWith(x)).length) return true;

    const tokens = requestedPath.split('/');
    tokens.length > 0 && tokens.shift();
    tokens.length > 0 && tokens.shift();

    const endpointWithoutPrefix = `/${tokens.join('/')}`;

    if (0 < exemptedAPIs.filter(x => endpointWithoutPrefix.startsWith(x)).length) return true;
    if (0 < exemptedAPIs.filter(x => endpointWithoutPrefix.endsWith(x)).length) return true;
  
    var directAccessFlag = false;
    ['.gif', '.png', '.svg', '.jpg', '.jpeg', '.mp4', '.wmv'].every(x => {
      if(requestedPath.endsWith(x)) {
        directAccessFlag = true;
        return false;
      }

      return true;
    });

    return (!/\/api\//.test(requestedPath) && directAccessFlag) || false;

  } catch (e) {
    logger.error(`[EXEMPTIONS] Error => ${e.message}`);
    return false;
  }
}

module.exports = main;