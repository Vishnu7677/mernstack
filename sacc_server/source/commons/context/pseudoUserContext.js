const logger = require('../logger/logger');
const MemoryCache = require('./core/memoryCache');

const CACHE   = {};
const PROCESS = {};

const {
  Context,
  Scheduler
} = MemoryCache(CACHE, PROCESS, 'pseudoUser');

logger.info('pseudoUser memory cache initialized!');

module.exports = {
  Context,
  Scheduler
}