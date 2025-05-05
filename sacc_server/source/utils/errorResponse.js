class ErrorResponse extends Error {
    statusCode
    constructor (message, status) {
      super(message)
      this.statusCode = status
    }
  }
  
module.exports = ErrorResponse;
