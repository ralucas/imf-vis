var winston = require('winston');
var path = require('path');

var logFile = path.join(__dirname, '../../logs/stdin.log');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ level: 'silly' }),
    new (winston.transports.File)({ filename: logFile, level: 'silly' })
  ]
});

module.exports = logger;
