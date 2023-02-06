import { CachingOptions, HttpOptions } from "domain/clients";
import { IServiceCollection, ServiceInjectionMode } from "domain/di";
import { LoggingOptions } from "domain/logging";
import { nameOf } from "domain/utils";
import { DomainService } from "./domainService";

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<DomainService>().httpOptions,
    (container: DomainService) =>
      new HttpOptions(container.appConfig, 'http'),
    ServiceInjectionMode.proxy
  )
}

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<DomainService>().cachingOptions,
    (container: DomainService) =>
      new CachingOptions(container.appConfig, 'caching'),
    ServiceInjectionMode.proxy
  )
}

export function addLoggingOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<DomainService>().loggingOptions,
    (container: DomainService) =>
      new LoggingOptions(container.appConfig, 'logging'),
    ServiceInjectionMode.proxy
  )
}