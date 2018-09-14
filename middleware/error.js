const winston = require('winston');

module.exports = function(err, req, res, next){
    winston.error(err.message, err);

    // error
    // warn
    // info
    // verbose
    // debug
    // silly
    const logger = new (winston.Logger)({
      transports: [
        // colorize the output to the console
        new (winston.transports.Console)({ colorize: true })
      ]
    });
    // Log the exception
    res.status(500).jsonp({
      status:"Failure",
      message:"Something Failed",
      object:[]
    });
}