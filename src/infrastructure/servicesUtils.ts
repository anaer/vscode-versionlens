import { asFunction, asValue, AwilixContainer, BuildResolver, Resolver } from "awilix";
import { ILogger, ILoggerChannel } from "domain/logging";
import { ISuggestionProvider } from "domain/suggestions";
import { createWinstonLogger, OutputChannelTransport } from "infrastructure/logging";
import { createSuggestionProvider } from "../application/providers/index";

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

  const promises = [];

  for (const providerName of providerNames) {
    const promise = createSuggestionProvider(providerName, container, logger);
    promises.push(promise);
  }

  // parallel the promises
  return Promise.all(promises);
}