const { createClient } = require('redis');
const logger = require('../../../../logger/logger');

async function init() {
  const client = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`  });
  
  client.on('error', (err) => { logger.error(`[REDIS] ${err}`); console.log('[REDIS] Error Stack Trace => ', err); });
  
  try {
    await client.connect();
  } catch (e) {
    logger.error(`[REDIS] Failed to connect... => ${e.message}`);
  }

  return client;
}

module.exports = init;