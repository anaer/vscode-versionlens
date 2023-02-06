import { IServiceProvider } from "domain/di";
import { ILogger } from "domain/logging";
import { IProviderModule } from "domain/providers";
import { ISuggestionProvider } from "domain/suggestions";
import { AwilixServiceCollection } from "infrastructure/di";

export function importSuggestionProvider(
  serviceProvider: IServiceProvider,
  providerName: string,
  logger: ILogger
): Promise<ISuggestionProvider | void> {

  return import(`infrastructure/providers/${providerName}/index`)
    .then(
      async function (module: IProviderModule) {
        logger.debug('Activating container scope for %s', providerName);

        // register the provider
        const childServiceProvider = await module.configureContainer(
          serviceProvider,
          new AwilixServiceCollection()
        );

        const suggestionProvider = childServiceProvider.getService<ISuggestionProvider>(
          `${providerName}SuggestionProvider`
        );

        logger.debug(
          "Registered provider for %s:\t file pattern: %s\t caching: %s seconds\t strict ssl: %s",
          providerName,
          suggestionProvider.config.fileMatcher.pattern,
          suggestionProvider.config.caching.duration / 1000,
          suggestionProvider.config.http.strictSSL,
        );

        return suggestionProvider;
      }
    )
    .catch(error => {
      logger.error(
        'Could not register provider %s. Reason: %O',
        providerName,
        error,
      );
    });

}