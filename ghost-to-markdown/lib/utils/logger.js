import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, label }) => {
      return `${timestamp} ${level}${label ? `[${label}]` : ""}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "download-errors.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "download.log" }),
  ],
});

export default logger;
