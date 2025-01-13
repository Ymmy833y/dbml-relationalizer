import { createLogger, format, transports } from 'winston';
import { TransformableInfo } from 'logform';

function customPrintfFormat(info: TransformableInfo): string {
  return `${info.timestamp} - ${info.level} - ${info.message}`;
};

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.printf(customPrintfFormat)
      ),
    }),
    new transports.File({
      filename: 'log/app.log',
      level: 'debug',
      format: format.combine(
        format.printf(customPrintfFormat)
      )
    })
  ]
});

export default logger;
