import { CachingOptions, HttpOptions } from 'domain/clients';
import { Config } from 'domain/configuration';
import { IServiceProvider } from 'domain/di';
import { ILogger, ILoggerChannel, LoggingOptions } from 'domain/logging';

export interface DomainService {
  serviceProvider: IServiceProvider,

  appConfig: Config,

  loggingOptions: LoggingOptions,

  httpOptions: HttpOptions,

  cachingOptions: CachingOptions,

  logger: ILogger

  loggerChannel: ILoggerChannel,
}