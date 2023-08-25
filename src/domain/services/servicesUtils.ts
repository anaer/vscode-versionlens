import { MemoryCache, MemoryExpiryCache } from "domain/caching";
import { CachingOptions, HttpOptions } from "domain/clients";
import { IServiceCollection } from "domain/di";
import { LoggingOptions } from "domain/logging";
import { nameOf } from "domain/utils";
import { IDomainServices } from "./iDomainServices";

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