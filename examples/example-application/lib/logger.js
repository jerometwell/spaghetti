const bunyan = require("bunyan");

class Logger {
  _logger = bunyan.createLogger({name: "TestApp"})
  info = this._logger.info.bind(this._logger);    
}

module.exports = {Logger};