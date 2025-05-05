function EcomException() {}
EcomException.prototype = Error.prototype;

module.exports = EcomException;