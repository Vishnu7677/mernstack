require('dotenv');

module.exports = {
  gateway: {
    user: {
      info: `${process.env.RS_SELF}/gw/api/user/info`,
    },
    login: {
      simulate: `${process.env.RS_SELF}/login/local`,
    }
  }
}