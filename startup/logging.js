var appRoot = require('app-root-path');
const winston = require('winston');
const morgan = require('morgan');
require('winston-mongodb');
require('express-async-errors');
const fs = require('fs');

const env = process.env.NODE_ENV || 'development';
process.on('uncaughtException', (ex) => {
  console.log('WE GOT AND UNCAUGHT EXCEPTION');
  winston.error(ex.message, ex);
  process.exit(1);
});

process.on('unhandledRejection', (ex) => {
  throw ex;
});

const logDir = 'log';
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
    console.log ("Directory for log created");
}
const tsFormat = () => (new Date()).toLocaleTimeString();

// define the custom settings for each transport (file, console)
var options = {
  file: {
    level: env === 'development' ? 'verbose' : 'info',
    datePattern: 'yyyy-MM-dd',
    filename: `${logDir}/-results.log`,
    prepend: true,
    timestamp: tsFormat,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
  mongoLog: {
    //db: 'mongodb://admin:12345@ds139067.mlab.com:39067/vidly',
    db: 'mongodb://admin:admin123@ds125881.mlab.com:25881/qau-smart-ride',
    level: 'info'
  }
};

// instantiate a new Winston Logger with the settings defined above
var logger = new winston.Logger({
  transports: [
    new (require('winston-daily-rotate-file'))(options.file),
    new winston.transports.Console(options.console),
    new winston.transports.MongoDB(options.mongoLog),
  ],
  exitOnError: false, // do not exit on handled exceptions
});


// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function(message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
};

module.exports = logger;
  


