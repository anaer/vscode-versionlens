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