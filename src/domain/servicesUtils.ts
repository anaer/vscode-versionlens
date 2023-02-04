import { asFunction, BuildResolver } from "awilix";
import { CachingOptions, HttpOptions } from "domain/clients";
import { LoggingOptions } from "domain/logging";

export function addHttpOptions(): BuildResolver<HttpOptions> {
  return asFunction(
    appConfig => new HttpOptions(appConfig, 'http')
  ).singleton();
}

export function addCachingOptions(): BuildResolver<CachingOptions> {
  return asFunction(
    appConfig => new CachingOptions(appConfig, 'caching')
  ).singleton();
}

export function addLoggingOptions(): BuildResolver<LoggingOptions> {
  // logging options
  return asFunction(
    appConfig => new LoggingOptions(appConfig, 'logging')
  ).singleton()
}
