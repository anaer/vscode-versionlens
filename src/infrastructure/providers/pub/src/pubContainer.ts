import { asFunction, AwilixContainer } from 'awilix';
import { CachingOptions, HttpOptions } from 'domain/clients';
import { ISuggestionProvider } from 'domain/suggestions';
import { createJsonClient } from 'infrastructure/http';
import { PubContributions } from './definitions/ePubContributions';
import { IPubServices } from './definitions/iPubServices';
import { PubClient } from './pubClient';
import { PubConfig } from './pubConfig';
import { PubSuggestionProvider } from './pubSuggestionProvider';

export function configureContainer(
  container: AwilixContainer<IPubServices>
): ISuggestionProvider {

  const services = {

    // options
    pubCachingOpts: asFunction(
      appConfig => new CachingOptions(
        appConfig,
        PubContributions.Caching,
        'caching'
      )
    ).singleton(),

    pubHttpOpts: asFunction(
      appConfig => new HttpOptions(
        appConfig,
        PubContributions.Http,
        'http'
      )
    ).singleton(),

    // config
    pubConfig: asFunction(
      (appConfig, pubCachingOpts, pubHttpOpts) =>
        new PubConfig(appConfig, pubCachingOpts, pubHttpOpts)
    ).singleton(),

    // clients
    pubJsonClient: asFunction(
      (pubCachingOpts, pubHttpOpts, logger) =>
        createJsonClient(
          {
            caching: pubCachingOpts,
            http: pubHttpOpts
          },
          logger.child({ namespace: 'pub request' })
        )
    ).singleton(),

    pubClient: asFunction(
      (pubConfig, pubJsonClient, logger) =>
        new PubClient(
          pubConfig,
          pubJsonClient,
          logger.child({ namespace: 'pub client' })
        )
    ).singleton(),

    // provider
    pubProvider: asFunction(
      (pubClient, logger) =>
        new PubSuggestionProvider(
          pubClient,
          logger.child({ namespace: 'pub provider' })
        )
    ).singleton(),
  };

  container.register(services)

  return container.cradle.pubProvider;
}