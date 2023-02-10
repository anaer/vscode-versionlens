import { ILogger, ILoggerChannel } from 'domain/logging';
import { loggers, format, transports } from 'winston';

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
    // vscode inserts it own timestamp with no formatting and can't be changed
    // may need to reimplement this behind a flag once the app is standalone from vscode

    // format.timestamp({ format: loggerChannel.logging.timestampFormat }),
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
    }
  );
}

function loggerFormatter(entry) {
  return `[${entry.timestamp}] [${entry.namespace}] [${entry.level}] ${entry.message}`
}