import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info', // Adjust logging level as needed (e.g., 'error', 'debug')
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console(), // Log to the console
    new transports.File({ filename: 'recipesServer.log' }) // Log to a file
  ]
});

export default logger;
