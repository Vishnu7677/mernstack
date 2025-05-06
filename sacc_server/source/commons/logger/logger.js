require('dotenv');
const winston = require('winston');
const moment = require('moment');

const logFilename = `./logs/${process.env.FILE_APP_LOG || 'app.log'}`;

const simplifyInfoLevel = (t) => { return /^.*[dD][eE][bB][uU][gG].*$/.test(t) ? "DEBUG" : /^.*[iI][nN][fF][oO].*$/.test(t) ? "INFO" : /^.*[eE][rR][rR][oO][rR].*$/.test(t) ? "ERROR" : /^.*[wW][aA][rR][nN].*$/.test(t) ? "WARN" : "_LOG_" };

const logFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf(info =>
    `${moment(info.timestamp).format(process.env.DATE_FORMAT)} | ${simplifyInfoLevel(info.level)}  \t=> ${info.message}`
  )
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({
      filename: logFilename,
      format: logFormat
    }),
  ],
});

if (process.env.ENVIRONMENT !== 'production') {
  logger.add(new winston.transports.Console({
    format: logFormat,
  }));
}

module.exports = logger;