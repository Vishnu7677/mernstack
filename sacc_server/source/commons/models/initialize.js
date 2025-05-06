const logger = require('../logger/logger');
const MongoDB = require('./mongo/runMongo');

async function connectDB() {
  try {
    await MongoDB();
    logger.info('MongoDB connection established!');
  } catch (e) {
    logger.error('Failed to initialize MongoDB connection =>', e);
  }
}

connectDB();
