require('dotenv');

function CreatedResponse({ message, data, metadata }) {
  return {
    data,
    metadata,
    status: 201,
    type: 'success',
    message: message || process.env.CREATED,
  };
}

module.exports = {
  code: 201,
  json: CreatedResponse,
};