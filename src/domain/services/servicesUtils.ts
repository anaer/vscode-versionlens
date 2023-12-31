import { CachingOptions, MemoryExpiryCache } from "domain/caching";
import { Config, TConfigSectionResolver } from "domain/configuration";
import { IServiceCollection } from "domain/di";
import { HttpOptions } from "domain/http";
import { LoggingOptions } from "domain/logging";
import { DependencyCache, PackageCache } from "domain/packages";
import { FileSystemStorage } from "domain/storage";
import {
  FetchPackageSuggestions,
  FetchProjectSuggestions,
  GetDependencyChanges,
  GetSuggestionProvider,
  importSuggestionProviders
} from "domain/useCases";
import { nameOf } from "domain/utils";
import { IDomainServices } from "./iDomainServices";

export function addAppConfig(
  services: IServiceCollection,
  configSection: string,
  configSectionResolver: TConfigSectionResolver
) {
  services.addSingleton(
    nameOf<IDomainServices>().appConfig,
    () => new Config(configSectionResolver, configSection.toLowerCase())
  )
}

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDomainServices>().httpOptions,
    (container: IDomainServices) => new HttpOptions(container.appConfig, 'http')
  )
}

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDomainServices>().cachingOptions,
    (container: IDomainServices) => new CachingOptions(container.appConfig, 'caching')
  )
}

export function addLoggingOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDomainServices>().loggingOptions,
    (container: IDomainServices) => new LoggingOptions(container.appConfig, 'logging')
  )
}

export function addFileSystemStorage(services: IServiceCollection) {
  const serviceName = nameOf<IDomainServices>().storage;
  services.addSingleton(serviceName, new FileSystemStorage());
}

export async function addSuggestionProviders(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDomainServices>().suggestionProviders,
    async (container: IDomainServices) => {
      return await importSuggestionProviders(
        container.serviceProvider,
        container.providerNames,
        container.logger
      )
    }
  )
}

export function addFileWatcherDependencyCache(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDomainServices>().fileWatcherDependencyCache,
    (container: IDomainServices) => new DependencyCache(container.providerNames)
  );
}

export function addSuggestionPackageCache(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDomainServices>().packageCache,
    (container: IDomainServices) => new PackageCache(container.providerNames)
  );
}

export function addProcessesCache(services: IServiceCollection) {
  const serviceName = nameOf<IDomainServices>().processesCache;
  services.addSingleton(serviceName, new MemoryExpiryCache(serviceName));
}

export function addGetSuggestionProviderUseCase(services: IServiceCollection) {
  const serviceName = nameOf<IDomainServices>().GetSuggestionProvider;
  services.addSingleton(
    serviceName,
    (container: IDomainServices) => new GetSuggestionProvider(container.suggestionProviders)
  );
}

export function addGetDependencyChangesUseCase(services: IServiceCollection) {
  const serviceName = nameOf<IDomainServices>().getDependencyChanges;
  services.addSingleton(
    serviceName,
    (container: IDomainServices) =>
      new GetDependencyChanges(
        container.storage,
        container.fileWatcherDependencyCache,
        container.logger.child({ namespace: serviceName })
      )
  );
}

export function addFetchProjectSuggestionsUseCase(services: IServiceCollection) {
  const serviceName = nameOf<IDomainServices>().fetchProjectSuggestions;
  services.addSingleton(
    serviceName,
    (container: IDomainServices) =>
      new FetchProjectSuggestions(
        container.fetchPackageSuggestions,
        container.logger.child({ namespace: serviceName })
      )
  );
}

export function addFetchPackageSuggestionsUseCase(services: IServiceCollection) {
  const serviceName = nameOf<IDomainServices>().fetchPackageSuggestions;
  services.addSingleton(
    serviceName,
    (container: IDomainServices) =>
      new FetchPackageSuggestions(
        container.packageCache,
        container.logger.child({ namespace: serviceName })
      )
  );
}