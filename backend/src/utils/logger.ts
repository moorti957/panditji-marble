// backend/src/utils/logger.ts

import winston from 'winston';
import path from 'path';
import fs from 'fs';

// ============================================================
// Ensure log directory exists
// ============================================================
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// ============================================================
// Log Formats
// ============================================================
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// ============================================================
// Create Winston Logger
// ============================================================
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Console transport (always active)
    new winston.transports.Console({
      format: consoleFormat,
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});

// ============================================================
// Add file transports in non-development environments
// ============================================================
if (process.env.NODE_ENV !== 'development') {
  // Combined logs
  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: logFormat,
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 5,
      tailable: true,
    })
  );

  // Error logs (separate file)
  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 5,
      tailable: true,
    })
  );
}

// ============================================================
// Optional: Add file transport for development (verbose)
// ============================================================
if (process.env.NODE_ENV === 'development') {
  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, 'debug.log'),
      level: 'debug',
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 3,
    })
  );
}

// ============================================================
// Stream for Morgan integration (optional)
// ============================================================
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// ============================================================
// Export logger instance
// ============================================================
export { logger };

// ============================================================
// Default export
// ============================================================
export default logger;