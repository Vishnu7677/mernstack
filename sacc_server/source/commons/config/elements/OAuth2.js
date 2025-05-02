require('dotenv');

module.exports = {
  client: {
    id: process.env.HYDRA_OAUTH2_CLIENT_ID,
    secret: process.env.HYDRA_OAUTH2_CLIENT_SECRET,
    scope: process.env.HYDRA_OAUTH2_SCOPE,
    state: process.env.HYDRA_OAUTH2_STATE,
  },
  path: {
    authorizePath: process.env.HYDRA_OAUTH2_AUTHORIZE_PATH,
    tokenHost: process.env.HYDRA_OAUTH2_TOKEN_HOST,
    tokenPath: process.env.HYDRA_OAUTH2_TOKEN_URL,
    revokePath: process.env.HYDRA_OAUTH2_REVOKE_URL,
    redirectPath: process.env.HYDRA_OAUTH2_REDIRECT_URI,
    postLogoutPath: process.env.HYDRA_OAUTH2_POST_LOGOUT_URL,
    adminPath: process.env.HYDRA_OAUTH2_ADMIN_URL,
    serverURL: process.env.HYDRA_SERVER_URL,
  }
}