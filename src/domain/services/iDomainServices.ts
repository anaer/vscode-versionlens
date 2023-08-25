import { ICache } from 'domain/caching';
import { IExpiryCache } from 'domain/caching/iExpiryCache';
import { CachingOptions, HttpOptions } from 'domain/clients';
import { Config } from 'domain/configuration';
import { IServiceCollectionFactory, IServiceProvider } from 'domain/di';
import { ILogger, ILoggerChannel, LoggingOptions } from 'domain/logging';
import { IPackageDependencyWatcher, ISuggestionProvider } from 'domain/suggestions';

export interface IDomainServices {

  serviceCollectionFactory: IServiceCollectionFactory;

  serviceProvider: IServiceProvider;

  appConfig: Config;

  loggingOptions: LoggingOptions;

  httpOptions: HttpOptions;

  cachingOptions: CachingOptions;

  logger: ILogger;

  loggerChannel: ILoggerChannel;

  providerNames: Array<string>;

  suggestionProviders: Array<ISuggestionProvider>;

  packageDependencyWatcher: IPackageDependencyWatcher;
  
  packageDependencyCache: ICache;

  changedPackageDependencyCache: ICache;

  suggestionCache: IExpiryCache;

  processesCache: IExpiryCache;

}