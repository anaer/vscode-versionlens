import { asFunction, AwilixContainer } from 'awilix';
import { CachingOptions, HttpOptions } from 'domain/clients';
import { ISuggestionProvider } from 'domain/suggestions';
import { createJsonClient } from 'infrastructure/http';
import { ComposerClient } from './composerClient';
import { ComposerConfig } from './composerConfig';
import { ComposerSuggestionProvider } from './composerSuggestionProvider';
import { ComposerContributions } from './definitions/eComposerContributions';
import { IComposerServices } from './definitions/iComposerServices';

export function configureContainer(
  container: AwilixContainer<IComposerServices>
): ISuggestionProvider {

  const services = {

    // options
    composerCachingOpts: asFunction(
      appConfig => new CachingOptions(
        appConfig,
        ComposerContributions.Caching,
        'caching'
      )
    ).singleton(),

    composerHttpOpts: asFunction(
      appConfig => new HttpOptions(
        appConfig,
        ComposerContributions.Http,
        'http'
      )
    ).singleton(),

    // config
    composerConfig: asFunction(
      (appConfig, composerCachingOpts, composerHttpOpts) =>
        new ComposerConfig(appConfig, composerCachingOpts, composerHttpOpts)
    ).singleton(),

    // clients
    composerJsonClient: asFunction(
      (composerCachingOpts, composerHttpOpts, logger) =>
        createJsonClient(
          {
            caching: composerCachingOpts,
            http: composerHttpOpts
          },
          logger.child({ namespace: 'composer request' })
        )
    ).singleton(),

    composerClient: asFunction(
      (composerConfig, composerJsonClient, logger) =>
        new ComposerClient(
          composerConfig,
          composerJsonClient,
          logger.child({ namespace: 'composer client' })
        )
    ).singleton(),

    // provider
    composerProvider: asFunction(
      (composerClient, logger) =>
        new ComposerSuggestionProvider(
          composerClient,
          logger.child({ namespace: 'composer provider' })
        )
    ).singleton(),
  };

  container.register(services)

  return container.cradle.composerProvider;
}