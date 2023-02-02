import { asFunction, AwilixContainer } from 'awilix';
import { CachingOptions, HttpOptions } from 'domain/clients';
import { ISuggestionProvider } from 'domain/suggestions';
import { createJsonClient } from 'infrastructure/http';
import { DubContributions } from './definitions/eDubContributions';
import { IDubServices } from './definitions/iDubServices';
import { DubClient } from './dubClient';
import { DubConfig } from './dubConfig';
import { DubSuggestionProvider } from './dubSuggestionProvider';

export function configureContainer(
  container: AwilixContainer<IDubServices>
): ISuggestionProvider {

  const services = {

    // options
    dubCachingOpts: asFunction(
      appConfig => new CachingOptions(
        appConfig,
        DubContributions.Caching,
        'caching'
      )
    ).singleton(),

    dubHttpOpts: asFunction(
      appConfig => new HttpOptions(
        appConfig,
        DubContributions.Http,
        'http'
      )
    ).singleton(),

    // config
    dubConfig: asFunction(
      (appConfig, dubCachingOpts, dubHttpOpts) =>
        new DubConfig(appConfig, dubCachingOpts, dubHttpOpts)
    ).singleton(),

    // clients
    dubJsonClient: asFunction(
      (dubCachingOpts, dubHttpOpts, logger) =>
        createJsonClient(
          {
            caching: dubCachingOpts,
            http: dubHttpOpts
          },
          logger.child({ namespace: 'dub request' })
        )
    ).singleton(),

    dubClient: asFunction(
      (dubConfig, dubJsonClient, logger) =>
        new DubClient(
          dubConfig,
          dubJsonClient,
          logger.child({ namespace: 'dub client' })
        )
    ).singleton(),

    // provider
    dubProvider: asFunction(
      (dubClient, logger) =>
        new DubSuggestionProvider(
          dubClient,
          logger.child({ namespace: 'dub provider' })
        )
    ).singleton(),
  };

  container.register(services)

  return container.cradle.dubProvider;
}