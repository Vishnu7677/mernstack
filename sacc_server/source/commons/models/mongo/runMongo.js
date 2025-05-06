require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../../logger/logger');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, 
      bufferTimeoutMS: 15000,   
    });

    mongoose.set('debug', (collectionName, method, query, doc) => {
      logger.info(`MONGO => ${collectionName}.${method} => ${JSON.stringify(query)} | ${JSON.stringify(doc)}`);
    });

    return mongoose;
  } catch (e) {
    logger.error('MongoDB failed to connect');
    throw e;
  }
}

module.exports = main;
