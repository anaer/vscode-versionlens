import { CachingOptions, IExpiryCache } from 'domain/caching';
import { Config } from 'domain/configuration';
import { IServiceCollectionFactory, IServiceProvider } from 'domain/di';
import { HttpOptions } from 'domain/http';
import { ILogger, ILoggerChannel, LoggingOptions } from 'domain/logging';
import { DependencyCache, IPackageDependencyWatcher, PackageCache } from 'domain/packages';
import { ISuggestionProvider } from 'domain/suggestions';

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

  dependencyCache: DependencyCache;

  packageCache: PackageCache;

  processesCache: IExpiryCache;

}