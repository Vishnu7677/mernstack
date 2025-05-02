const httpsRef        = require('https');
const axiosHTTP       = require('axios');
const logger          = require('../../logger/logger');
const axiosConnection = axiosHTTP.default;
const axiosRetry      = require('axios-retry');
const axiosHTTPS      = axiosConnection.create({
  httpsAgent: new httpsRef.Agent({
    rejectUnauthorized: false
  })
});

const defaultRetryCount = +process.env.API_FAIL_DEFAULT_RETRY_COUNT || 3;

axiosRetry(axiosHTTP , { retries: defaultRetryCount, retryDelay: axiosRetry.exponentialDelay });
axiosRetry(axiosHTTPS, { retries: defaultRetryCount, retryDelay: axiosRetry.exponentialDelay });

function reportApiFailure({ url, headers, data }, { isAxiosError, response }) {
  try {
    const { MessageQueue } = require('../externalsManager');
    const error = {
      isAxiosError,
      response: {
        data: response.data,
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
      }
    }

    MessageQueue.Kafka.publish(process.env.MQTOPIC_API_FAIL_ALERT || 'apicallfailed', {
      key: String(Date.now()),
      value: JSON.stringify({ url, headers, data, error }),
      headers: {
        source: "gateway",
        action: "logging",
        type: "api-call",
        "spring_json_header_types": JSON.stringify({ "type": "java.lang.String" })
      },
    });
  } catch (e) {
    logger.error(e.message);
  }

  return true;
}

function _interface(caller) {
  return {
    get: async function (url, headers, data, unsafe = false) {
      let r;

      if(unsafe) {
        r = await caller.get(url, { headers, data });
      } else {
        try { r = await caller.get(url, { headers, data }); } catch (e) {
          r = e.response;
  
          if(!!process.env.API_FAIL_SHOULD_NOTIFY_KAFKA) {
            reportApiFailure({ url, headers, data }, e);
          }
        }
      }

      return r;
    },

    post: async function (url, headers, data, unsafe = false) {
      let r;

      if(unsafe) {
        r = await caller.post(url, data, { headers });
      } else {
        try { r = await caller.post(url, data, { headers }); } catch (e) {
          r = e.response;
  
          if(!!process.env.API_FAIL_SHOULD_NOTIFY_KAFKA) {
            reportApiFailure({ url, headers, data }, e);
          }
        }
      }

      return r;
    },

    patch: async function(url, headers, data, unsafe = false) {
      let r;

      if(unsafe) {
        r = await caller.patch(url, data, { headers });
      } else {
        try { r = await caller.patch(url, data, { headers }); } catch (e) {
          r = e.response;
  
          if(!!process.env.API_FAIL_SHOULD_NOTIFY_KAFKA) {
            reportApiFailure({ url, headers, data }, e);
          }
        }
      }

      return r;
    },

    put: async function(url, headers, data, unsafe = false) {
      let r;

      if(unsafe) {
        r = await caller.put(url, data, { headers });
      } else {
        try { r = await caller.put(url, data, { headers }); } catch (e) {
          r = e.response;
  
          if(!!process.env.API_FAIL_SHOULD_NOTIFY_KAFKA) {
            reportApiFailure({ url, headers, data }, e);
          }
        }
      }

      return r;
    }
  }
}

const http  = _interface(axiosHTTP);
const https = _interface(axiosHTTPS);

module.exports = {
  http,
  https,
}