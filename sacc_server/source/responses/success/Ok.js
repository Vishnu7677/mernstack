require('dotenv');

function OkResponse({ message, data, metadata }) {
  return {
    data,
    metadata,
    status: 200,
    type: 'success',
    message: message || process.env.OK,
  };
}

module.exports = {
  code: 200,
  json: OkResponse,
};