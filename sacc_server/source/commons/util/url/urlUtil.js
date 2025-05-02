function URLUtil () {}

// binds base & relative url into one
URLUtil.prototype.makeAbsolute = function (relativeUrl, baseUrl) {
  const url = new URL(relativeUrl, baseUrl);
  return url.href;
}

URLUtil.prototype.getReducedRequest = function(req) {
  return {
    body: req.body,
    params: req.params,
    headers: req.headers,
    query: req.query,
    metadata: {
      request: {
        startTime: req._startTime,
        method: req.method,
        originalURL: req.originalUrl,
        baseURL: req.baseUrl,
        url: req.url,
        sessionId: req?.client?._tlsOptions?.server?.sessionIdContext,
      },
      client: {
        ip: req.headers.ip || req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || req.connection?.socket?.remoteAddress || '',
        platform: req.headers.platform,
        os: req.headers.os,
      }
    },
  }
}

URLUtil.prototype.isDeveloperRequest = function(headers) {
  return headers['user-agent'].indexOf('ostman') > -1;
}

URLUtil.prototype.encodeURI = function (text) {
  return Buffer.from(text).toString('base64');
}

module.exports = new URLUtil();