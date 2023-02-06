import { CachingOptions, HttpOptions } from 'domain/clients';
import { AppConfig } from 'domain/configuration';
import { IServiceProvider } from 'domain/di';
import { ILogger, ILoggerChannel, LoggingOptions } from 'domain/logging';

export interface DomainService {
  serviceProvider: IServiceProvider,

  appConfig: AppConfig,

  loggingOptions: LoggingOptions,

  httpOptions: HttpOptions,

  cachingOptions: CachingOptions,

  logger: ILogger

  loggerChannel: ILoggerChannel,
}