const fs = require('fs');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

let logger = null
let transport = null

module.exports = {
  getLogger () {
    if (!logger) {
      let logDirectory = process.env.LOG_DIRECTORY
      let logMaxSize = process.env.LOG_MAX_SIZE
      let logMaxFiles = process.env.LOG_MAX_FILE

      if (typeof logDirectory === 'undefined' || !fs.existsSync(logDirectory)) {
        logDirectory = '/tmp/'
      }
      if (typeof logMaxSize === 'undefined' || !logMaxSize.length) {
        logMaxSize = '20m'
      }
      if (typeof logMaxFiles === 'undefined' || !logMaxFiles.length || parseInt(logMaxFiles) <= 0 || isNaN(logMaxFiles)) {
        logMaxFiles = 3
      }

      transport = new DailyRotateFile({
        dirname: logDirectory,
        filename: 'application-%DATE%.log',
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        maxSize: logMaxSize,
        maxFiles: logMaxFiles
      })

      transport.on('rotate', function (oldFilename, newFilename) {
        console.log(`Old file : ${oldFilename}, New file : ${newFilename}`)
      })

      logger = winston.createLogger({
        transports: [
          transport
        ]
      })
    }
    return logger
  }
}
