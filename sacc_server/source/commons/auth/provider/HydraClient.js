require('dotenv').config();
const { URL } = require("url");
const fetch = require("node-fetch");
const { AuthorizationCode } = require('simple-oauth2');
const logger = require('../../logger/logger');
const { url: urlUtil } = require('../../util/UtilManager');
const { OAuth2Config: OAUTH2_CONFIG } = require('../../config/ConfigManager');
const Response = require('../../responses/EcomResponseManager');

const HYDRA_CLIENT_CONFIG = {
  client_id                 : OAUTH2_CONFIG.client.id,
  client_secret             : OAUTH2_CONFIG.client.secret,
  grant_types               : ["authorization_code","refresh_token"],
  redirect_uris             : [OAUTH2_CONFIG.path.redirectPath],
  post_logout_redirect_uris : [OAUTH2_CONFIG.path.postLogoutPath],
  response_types            : ["code"],
  scope                     : OAUTH2_CONFIG.client.scope,
  subject_type              : "public",
  token_endpoint_auth_method: "client_secret_basic"
};

const client = new AuthorizationCode({
  client: {
    id    : OAUTH2_CONFIG.client.id,
    secret: OAUTH2_CONFIG.client.secret
  },
  auth: {
    authorizePath: OAUTH2_CONFIG.path.authorizePath,
    tokenHost    : OAUTH2_CONFIG.path.tokenHost,
    tokenPath    : OAUTH2_CONFIG.path.tokenPath,
    revokePath   : OAUTH2_CONFIG.path.revokePath
  },
  http: {
    json: true,
  }
});

async function ensureClient() {
  const getClientResponse = await fetch(
    urlUtil.makeAbsolute(`/clients/${OAUTH2_CONFIG.client.id}`, OAUTH2_CONFIG.path.adminPath), 
  {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  if (![200, 404].includes(getClientResponse.status)) {
    logger.error(await getClientResponse.text());
    logger.error(getClientResponse.status);
    throw new Error(`Could not get Hydra client [${getClientResponse.status}]`);
  }

  if (getClientResponse.status === 200) {
    // Update the client to be sure it has the latest config
    const updateClientResponse = await fetch(
      urlUtil.makeAbsolute(`clients/${OAUTH2_CONFIG.client.id}`, OAUTH2_CONFIG.path.adminPath), 
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(HYDRA_CLIENT_CONFIG)
    });

    if (updateClientResponse.status !== 200) {
      logger.error(await updateClientResponse.text());
      logger.error(updateClientResponse.status);
      throw new Error(`Could not update Hydra client [${updateClientResponse.status}]`);
    }
  } else {
    const response = await fetch(urlUtil.makeAbsolute("/clients", OAUTH2_CONFIG.path.adminPath), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(HYDRA_CLIENT_CONFIG)
    });

    switch (response.status) {
      case 200:
      case 201:
      case 409:
        break;
      default:
        logger.error(await response.text());
        throw new Error(`Could not create Hydra client [${response.status}]`);
    }
  }
}

async function getAuthorizationURI() {
  return client.authorizeURL({
    redirectURI: OAUTH2_CONFIG.path.redirectPath,
    scope: OAUTH2_CONFIG.client.scope,
    state: OAUTH2_CONFIG.client.state,
  });
}

async function getAuthorizationCode(checkinURI, userId) {
  const redirect1 = checkinURI.headers.get("location");
  const redirect1Parsed = new URL(redirect1);

  if (redirect1.includes("oauth-error")) {
    throw new Error(redirect1Parsed.searchParams.get("error_hint"));
  }

  const challenge = redirect1Parsed.searchParams.get("login_challenge");
  const cookie = checkinURI.headers.get("set-cookie");

  const acceptLoginResult = await fetch(
    `${urlUtil.makeAbsolute(
      "/oauth2/auth/requests/login/accept", OAUTH2_CONFIG.path.adminPath
    )}?login_challenge=${challenge}`,
    {
      method: "PUT",
      body: JSON.stringify({
        subject: userId,
        remember: false
      }),
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  let { redirect_to: redirect2Temp } = await acceptLoginResult.json();
  const redirect2 = redirect2Temp.replace('localhost', OAUTH2_CONFIG.path.serverURL);

  const continueLoginResult = await fetch(redirect2, {
    headers: {
      Cookie: cookie
    },
    redirect: "manual"
  });

  const redirect3 = continueLoginResult.headers.get("location");
  const redirect3Parsed = new URL(redirect3);

  if (redirect3.includes("error_debug")) {
    throw new Error(redirect3Parsed.searchParams.get("error_debug"));
  }

  const consentChallenge = redirect3Parsed.searchParams.get("consent_challenge");
  const nextCookies = continueLoginResult.headers.raw()["set-cookie"];

  const consentResult = await fetch(
    `${urlUtil.makeAbsolute(
      "/oauth2/auth/requests/consent/accept", OAUTH2_CONFIG.path.adminPath
    )}?consent_challenge=${consentChallenge}`,
    {
      method: "PUT",
      body: JSON.stringify({
        grant_scope: ["offline", "openid"], // eslint-disable-line camelcase
        remember: false
      }),
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  const { redirect_to: redirect4Temp } = await consentResult.json();
  const redirect4 = redirect4Temp.replace('localhost', OAUTH2_CONFIG.path.serverURL);

  const postConsentResult = await fetch(redirect4, {
    headers: nextCookies.map((val) => (["Cookie", val])),
    redirect: "manual"
  });

  const redirect5 = postConsentResult.headers.get("location");
  const redirect5Parsed = new URL(redirect5);

  if (redirect5.includes("error_debug")) {
    throw new Error(redirect5Parsed.searchParams.get("error_debug"));
  }

  return redirect5Parsed.searchParams.get("code");
}

async function getAccessToken(checkinURI, userId) {
  const authorizationCode = await getAuthorizationCode(checkinURI, userId);
  const accessToken = await client.getToken({
    code: authorizationCode,
    redirectURI: OAUTH2_CONFIG.path.redirectPath,
    scope: OAUTH2_CONFIG.client.scope
  });

  return accessToken.token;
}

async function refreshAccessToken(tokenObj) {
  let accessToken = {};

  try {
    accessToken = client.createToken(tokenObj);
    
    if (accessToken.expired()) {
      const refreshParams = {
        scope: OAUTH2_CONFIG.client.scope,
      };

      accessToken = await accessToken.refresh(refreshParams);
    }
  } catch (e) {
    throw Error('Error refreshing token => ', e.message);
  }

  return accessToken.token;
}

async function revokeAccessToken(tokenObj) {
  try {
    const accessToken = client.createToken(tokenObj);

    await accessToken.revoke('access_token');
    await accessToken.revoke('refresh_token');

  } catch (e) {
    logger.error('Error revoking token => ', e.message);
    return Response.error.InternalError();
  }

  return Response.success.Ok.json({ message: 'Success! Access token revoked...' });
}

module.exports = {
  ensureClient,
  getAuthorizationURI,
  getAccessToken,
  refreshAccessToken,
  revokeAccessToken,
}
