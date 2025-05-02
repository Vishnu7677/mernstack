const logger  = require('../../logger/logger');
const {
  Storage
} = require('../../externals/externalsManager');

function initialize(CACHE = {}, PROCESS = {}, callname = '') {
  const Context = Object.freeze({
    get: async function(key) {
      let value;

      try {
        const RemoteCache = await Storage.disk.cache();
        value = JSON.parse(await RemoteCache.get(`${callname}_${key}`));
      } catch (e) {
        logger.error(`[MEMCACHE-READ] Error => ${e.message}`);
        value = CACHE[key];
      }

      return value;
    },
    set: async function(key, value) {
      try {
        const RemoteCache = await Storage.disk.cache();
        RemoteCache.set(`${callname}_${key}`, JSON.stringify(value));
      } catch (e) {
        logger.error(`[MEMCACHE-WRITE] Error => ${e.message}`);
        CACHE[key] = value;
      }

      logger.info(`[${callname}:MEMCACHE] => Entry created with ID [${key}]`);
    },
    del: async function(key) {
      clearTimeout(PROCESS[key]);

      try {
        const RemoteCache = await Storage.disk.cache();
        RemoteCache.del(`${callname}_${key}`);
      } catch (e) {
        logger.error(`[MEMCACHE-DELETE] Error => ${e.message}`);
        delete CACHE[key]; 
        delete PROCESS[key];
      }

      logger.info(`[${callname}:MEMCACHE] => Entry deleted having ID [${key}]`);
    },
  });
  
  const Scheduler = Object.freeze({
    schedule: function(options, callback) {
      const { key, timeout, value } = options;
  
      if(key && timeout && value) {
        try {
          Context.set(key, value);
          PROCESS[key] = setTimeout(() => {
            this.clear(options, null);
            if(callback) {
              logger.info(`[${callname}:MEMSCHEDULER] => Invoking Callback!`);
              callback(options)
            }
          }, 1000 * timeout);
          logger.info(`[${callname}:MEMSCHEDULER] => Process Created for ID[${key}] to Callback in ${timeout}seconds`);
          return true;
        } catch (e) {
          logger.error(e.message);
        }
      }
  
      return false;
    },
    reschedule: function(options, callback) {
      this.schedule(options, callback);
    },
    clear: function(options, callback) {
      const { key } = options;
  
      if(key) {
        try {
          Context.del(key);
          if(callback) {
            callback(options);
          }
          logger.info(`[${callname}:MEMSCHEDULER] => Process Schedule revoked for ID[${key}]`);
          return true;
        } catch (e) {
          logger.error(e.message);
        }
      }
  
      return false;
    }
  });

  return {
    Context,
    Scheduler
  }
}

module.exports = initialize;