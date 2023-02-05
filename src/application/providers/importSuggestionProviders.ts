import { IServiceProvider } from "domain/di";
import { ILogger } from "domain/logging";
import { ISuggestionProvider } from "domain/suggestions";
import { importSuggestionProvider } from "./createSuggestionProvider";

export async function importSuggestionProviders(
  serviceProvider: IServiceProvider,
  providerNames: Array<string>,
  logger: ILogger
): Promise<Array<ISuggestionProvider>> {

  logger.debug('Loading suggestion providers %o', providerNames.join(', '));

  const promises = [];

  for (const providerName of providerNames) {
    const promise = importSuggestionProvider(
      serviceProvider,
      providerName,
      logger
    );
    promises.push(promise);
  }

  // parallel the promises
  return Promise.all(promises);
}