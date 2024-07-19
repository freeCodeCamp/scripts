import winston from 'winston';
import { format } from 'winston';
import { join } from 'path';

const { combine, timestamp, printf, colorize, json } = format;

// Custom log format for console transport
const consoleFormat = combine(
  colorize(),
  timestamp(),
  printf(({ timestamp, level, message, label }) => {
    return `${timestamp} ${
      label ? `[${label}]` : '       '
    } ${level}: ${message}`;
  })
);

// Custom log format for file transports
const fileFormat = combine(timestamp(), json());

// Generate timestamped log filenames
const generateLogFilename = (level) => {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  return `${level}-${timestamp}.log`;
};

// Create a logger instance
const logger = winston.createLogger({
  level: 'info',
  format: fileFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat
    }),
    new winston.transports.File({
      filename: join('logs', generateLogFilename('error')),
      level: 'error'
    }),
    new winston.transports.File({
      filename: join('logs', generateLogFilename('all'))
    })
  ]
});

export default logger;
