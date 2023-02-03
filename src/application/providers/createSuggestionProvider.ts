import { AwilixContainer } from "awilix";
import { ILogger } from "domain/logging/index";
import { IProviderModule } from "domain/providers/index";
import { ISuggestionProvider } from "domain/suggestions/index";

export function createSuggestionProvider(
  providerName: string,
  container: AwilixContainer<any>,
  logger: ILogger
): Promise<ISuggestionProvider | void> {

  return import(`infrastructure/providers/${providerName}/index`)
    .then(
      function (module: IProviderModule) {
        logger.debug('Activating container scope for %s', providerName);

        // create a container scope for the provider
        const scopeContainer = container.createScope();

        // register the provider
        const provider = module.configureContainer(scopeContainer);

        logger.debug(
          "Registered provider for %s:\t file pattern: %s\t caching: %s seconds\t strict ssl: %s",
          providerName,
          provider.config.fileMatcher.pattern,
          provider.config.caching.duration / 1000,
          provider.config.http.strictSSL,
        );

        return provider;
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