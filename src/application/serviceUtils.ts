import { asFunction, asValue, BuildResolver, Resolver } from "awilix";
import { CachingOptions, HttpOptions } from "domain/clients";
import { ILogger, ILoggerChannel, LoggingOptions } from "domain/logging";
import { createWinstonLogger, OutputChannelTransport } from "infrastructure/logging";

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

export function addWinstonChannelLogger(): BuildResolver<ILoggerChannel> {
  return asFunction(
    (outputChannel, loggingOptions) =>
      new OutputChannelTransport(outputChannel, loggingOptions)
  ).singleton();
}

export function addWinstonLogger(namespace: string): BuildResolver<ILogger> {
  return asFunction(
    (loggerChannel) =>
      createWinstonLogger(loggerChannel, { namespace })
  ).singleton();
}

export function addSuggestionProviderNames(): Resolver<Array<string>> {
  return asValue([
    'composer',
    'dotnet',
    'dub',
    'maven',
    'npm',
    'pub',
  ]);
}