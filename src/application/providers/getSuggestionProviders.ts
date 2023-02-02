import { AwilixContainer } from 'awilix';
import { ILogger } from 'domain/logging';
import { ISuggestionProvider } from 'domain/suggestions';
import { createSuggestionProvider } from './createSuggestionProvider';

export async function getSuggestionProviders(
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