import { CachingOptions, MemoryExpiryCache } from "domain/caching";
import { Config, TConfigSectionResolver } from "domain/configuration";
import { IServiceCollection } from "domain/di";
import { HttpOptions } from "domain/http";
import { LoggingOptions } from "domain/logging";
import { DependencyCache, PackageCache } from "domain/packages";
import { importSuggestionProviders } from "domain/providers";
import { GetSuggestions } from "domain/suggestions";
import { nameOf } from "domain/utils";
import { IDomainServices } from "./iDomainServices";

export function addAppConfig(
  services: IServiceCollection,
  configSectionResolver: TConfigSectionResolver,
  appName: string
) {
  services.addSingleton(
    nameOf<IDomainServices>().appConfig,
    () => new Config(configSectionResolver, appName.toLowerCase())
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

export function addPackagesDependencyCache(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDomainServices>().dependencyCache,
    (container: IDomainServices) => new DependencyCache(container.providerNames)
  );
}

export function addSuggestionDependencyCache(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDomainServices>().packageCache,
    (container: IDomainServices) => new PackageCache(container.providerNames)
  );
}

export function addProcessesCache(services: IServiceCollection) {
  const serviceName = nameOf<IDomainServices>().processesCache;
  services.addSingleton(serviceName, new MemoryExpiryCache(serviceName));
}

export function addGetSuggestionsUseCase(services: IServiceCollection) {
  const serviceName = nameOf<IDomainServices>().getSuggestions;
  services.addSingleton(
    serviceName,
    (container: IDomainServices) =>
      new GetSuggestions(
        container.dependencyCache,
        container.logger.child({ namespace: serviceName })
      )
  );
}