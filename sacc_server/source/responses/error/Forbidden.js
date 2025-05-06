require('dotenv');
const EcomException = require('./EcomException');

function ForbiddenAccess (message) {
  return {
    status: 403,
    type: "failure",
    message: message || process.env.FORBIDDEN,
  };
}

ForbiddenAccess.prototype = new EcomException();

module.exports = {
  code: 403,
  json: ForbiddenAccess,
};