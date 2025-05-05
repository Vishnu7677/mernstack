require('dotenv');

function AcceptedResponse({ message, data, metadata }) {
  return {
    data,
    metadata,
    status: 202,
    type: 'success',
    message: message || process.env.ACCEPTED,
  };
}

module.exports = {
  code: 202,
  json: AcceptedResponse,
};