import { CachingOptions, HttpOptions } from "domain/clients";
import { IServiceCollection } from "domain/di";
import { LoggingOptions } from "domain/logging";
import { DomainService } from "./eDomainService";

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    DomainService.httpOptions,
    appConfig => new HttpOptions(appConfig, 'http')
  )
}

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    DomainService.cachingOptions,
    appConfig => new CachingOptions(appConfig, 'caching')
  )
}

export function addLoggingOptions(services: IServiceCollection) {
  services.addSingleton(
    DomainService.loggingOptions,
    appConfig => new LoggingOptions(appConfig, 'logging')
  )
}