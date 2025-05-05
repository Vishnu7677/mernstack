const moment = require('moment');

function DateTimeUtil() {}

// convert array to map by pk
DateTimeUtil.prototype.getDateObj = function(input, format = 'YYYY-MM-DD HH:mm') {
  return moment(input, format);
}

DateTimeUtil.prototype.formatDate = function(input, format = 'DD/MM/YYYY') {
  return moment(input).format(format);
}

DateTimeUtil.prototype.now = function(input = moment.now()) {
  return moment(input);
}

DateTimeUtil.prototype.addDeltaToMoment = function(delta = 600, input = moment.now(), deltaDef = 'seconds') {
  return moment(input).add(delta, deltaDef);
}

DateTimeUtil.prototype.addDaysToDate = function(input, nDays, format  = 'YYYY-MM-DD HH:mm') {
  return moment(input, format).add(nDays, 'days');
}

DateTimeUtil.prototype.addDurationToDate = function(n = 0, unit = 'days', input=moment(), format = 'YYYY-MM-DD HH:mm') {
  return moment(input, format).add(n, unit);
}

DateTimeUtil.prototype.dateDifferenceBetween = function(end, start, on='days') {
  start = moment(start || moment.now());
  end   = moment(end   || moment.now());

  return end.diff(start, on);
}

DateTimeUtil.prototype.isDateBetween = function(start, input, end, on = 'days', format  = 'YYYY-MM-DD') {
  start = moment(start || moment.now(), format);
  end   = moment(end   || moment.now(), format);

  return moment(input).isBetween(start, end, on, '[]');
}

DateTimeUtil.prototype.dateAndTimeDiff = function(date,timeInSeconds) {
  const originalDateTime = moment(date);
  const currentDate = moment();
  const diffInSeconds = currentDate.diff(originalDateTime, 'seconds');
  return diffInSeconds > timeInSeconds ? true : false
}

module.exports = new DateTimeUtil();