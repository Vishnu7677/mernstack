require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../../logger/logger');

async function main() {
  try {
    const isProd = process.env.NODE_ENV === 'production';

    // 🔹 Disable autoIndex in production to avoid index builds on every boot
    if (isProd) {
      mongoose.set('autoIndex', false);
    }

    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
      bufferTimeoutMS: 15000,
    });

    // 🔹 Only enable verbose query logging in non-production
    if (!isProd) {
      mongoose.set('debug', (collectionName, method, query, doc) => {
        logger.info(
          `MONGO => ${collectionName}.${method} => ${JSON.stringify(
            query
          )} | ${JSON.stringify(doc)}`
        );
      });
    }

    logger.info('MongoDB connected successfully');
    return mongoose;
  } catch (e) {
    logger.error('MongoDB failed to connect', e);
    throw e;
  }
}

module.exports = main;
