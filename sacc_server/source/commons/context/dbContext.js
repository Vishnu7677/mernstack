const logger = require('../logger/logger');
const MemoryCache = require('./core/memoryCache');

const CACHE   = {};
const PROCESS = {};

const {
  Context,
  Scheduler
} = MemoryCache(CACHE, PROCESS, 'DB');

logger.info('DB memory cache initialized!');

module.exports = {
  Context,
  Scheduler
}