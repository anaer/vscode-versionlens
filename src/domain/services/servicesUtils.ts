import { CachingOptions, MemoryCache, MemoryExpiryCache } from "domain/caching";
import { Config, TConfigSectionResolver } from "domain/configuration";
import { IServiceCollection } from "domain/di";
import { HttpOptions } from "domain/http";
import { LoggingOptions } from "domain/logging";
import { importSuggestionProviders } from "domain/providers";
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
    (container: IDomainServices) =>
      new HttpOptions(container.appConfig, 'http')
  )
}

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDomainServices>().cachingOptions,
    (container: IDomainServices) =>
      new CachingOptions(container.appConfig, 'caching')
  )
}

export function addLoggingOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDomainServices>().loggingOptions,
    (container: IDomainServices) =>
      new LoggingOptions(container.appConfig, 'logging')
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
  const serviceName = nameOf<IDomainServices>().packageDependencyCache;
  services.addSingleton(serviceName, new MemoryCache(serviceName));
}

export function addChangedPackagesDependencyCache(services: IServiceCollection) {
  const serviceName = nameOf<IDomainServices>().changedPackageDependencyCache;
  services.addSingleton(serviceName, new MemoryCache(serviceName));
}

export function addSuggestionDependencyCache(services: IServiceCollection) {
  const serviceName = nameOf<IDomainServices>().suggestionCache;
  services.addSingleton(serviceName, new MemoryExpiryCache(serviceName));
}

export function addProcessesCache(services: IServiceCollection) {
  const serviceName = nameOf<IDomainServices>().processesCache;
  services.addSingleton(serviceName, new MemoryExpiryCache(serviceName));
}