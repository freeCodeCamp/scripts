const ProgressBar = require('progress');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const winstonLogFormat = printf(({ message, label, timestamp }) => {
  return `${timestamp} [${label}]: ${message}`;
});

const winstonLogger = createLogger({
  level: 'info',
  format: combine(label({ label: 'INFO' }), timestamp(), winstonLogFormat),
  transports: [
    // - Write all logs with level `error` and below to `error.log`
    new transports.File({
      filename: 'error.log',
      level: 'error',
      format: combine(label({ label: 'ERROR' }), timestamp(), winstonLogFormat)
    }),

    // - Write all logs with level `info` and below to `combined.log`
    new transports.File({ filename: 'combined.log' })
  ]
});

const generateProgressBar = (progressBarLength) => {
  const bar = new ProgressBar(
    '  Migrating :current/:total records at :rate records/s | :percent complete | ETA :etas | [:bar]',
    {
      complete: '█',
      incomplete: ' ',
      width: progressBarLength > 150 ? 150 : progressBarLength,
      total: progressBarLength
    }
  );
  const progress = {
    tick: () => bar.tick(),
    end: () => bar.update(1)
  };
  return progress;
};

const logger = (type, index, msg, param) => {
  index = index + '';
  const message = index.padStart(6, 0) + msg.padStart(20, ' ') + ' ' + param;
  winstonLogger.log({
    level: type,
    message: message
  });
};

module.exports = { logger, generateProgressBar };
