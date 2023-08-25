import { ILogger, ILoggerChannel } from 'domain/logging';
import { TransformableInfo } from 'logform';
import { format, loggers, transports } from 'winston';
import { loggingLevels } from './logLevels';

export function createWinstonLogger(
  loggerChannel: ILoggerChannel,
  defaultMeta: object
): ILogger {

  const logTransports: any[] = [
    // capture errors in the console
    new transports.Console({ level: 'error' }),

    // send info to the transport
    loggerChannel
  ];

  const logFormat = format.combine(
    format.timestamp({ format: loggerChannel.logging.timestampFormat }),
    format.simple(),
    format.splat(),
    format.printf(loggerFormatter)
  );

  return loggers.add(
    loggerChannel.name,
    {
      format: logFormat,
      defaultMeta,
      transports: logTransports,
      levels: loggingLevels
    }
  );
}

function loggerFormatter(entry: TransformableInfo) {
  return `[${entry.timestamp}] [${entry.namespace}] [${entry.level}] ${entry.message}`
}