import { CachingOptions, HttpOptions } from 'domain/clients';
import { Config } from 'domain/configuration';
import { IServiceCollectionFactory, IServiceProvider } from 'domain/di';
import { ILogger, ILoggerChannel, LoggingOptions } from 'domain/logging';
import { ISuggestionProvider } from 'domain/suggestions';

export interface IDomainServices {

  serviceCollectionFactory: IServiceCollectionFactory,

  serviceProvider: IServiceProvider,

  appConfig: Config,

  loggingOptions: LoggingOptions,

  httpOptions: HttpOptions,

  cachingOptions: CachingOptions,

  logger: ILogger

  loggerChannel: ILoggerChannel,

  providerNames: Array<string>,

  suggestionProviders: Array<ISuggestionProvider>
  
}