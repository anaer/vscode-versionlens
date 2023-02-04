import { asFunction, asValue, AwilixContainer, BuildResolver, Resolver } from "awilix";
import { CachingOptions, HttpOptions } from "domain/clients";
import { ILogger, ILoggerChannel, LoggingOptions } from "domain/logging";
import { ISuggestionProvider } from "domain/suggestions";
import { createWinstonLogger, OutputChannelTransport } from "infrastructure/logging";
import { createSuggestionProvider } from "./providers";

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

export async function addSuggestionProviders(
  providerNames: Array<string>,
  container: AwilixContainer<any>,
  logger: ILogger
): Promise<Array<ISuggestionProvider>> {

  logger.debug('Loading suggestion providers %o', providerNames.join(', '));

  const results: Array<ISuggestionProvider> = [];

  for (const providerName of providerNames) {
    const provider = await createSuggestionProvider(providerName, container, logger);
    if (provider) results.push(provider);
  }

  return results;
}