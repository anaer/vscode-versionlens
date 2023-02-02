import { asFunction, AwilixContainer } from 'awilix';
import { CachingOptions, HttpOptions } from 'domain/clients';
import { ISuggestionProvider } from 'domain/suggestions';
import { createHttpClient } from 'infrastructure/http';
import { createProcessClient } from 'infrastructure/process';
import { MavenClient } from './clients/mavenClient';
import { MvnCli } from './clients/mvnCli';
import { MavenContributions } from './definitions/eMavenContributions';
import { IMavenServices } from './definitions/iMavenServices';
import { MavenConfig } from './mavenConfig';
import { MavenSuggestionProvider } from './mavenSuggestionProvider';

export function configureContainer(
  container: AwilixContainer<IMavenServices>
): ISuggestionProvider {

  const services = {

    // options
    mavenCachingOpts: asFunction(
      appConfig => new CachingOptions(
        appConfig,
        MavenContributions.Caching,
        'caching'
      )
    ).singleton(),

    mavenHttpOpts: asFunction(
      appConfig => new HttpOptions(
        appConfig,
        MavenContributions.Http,
        'http'
      )
    ).singleton(),

    // config
    mavenConfig: asFunction(
      (appConfig, mavenCachingOpts, mavenHttpOpts) =>
        new MavenConfig(
          appConfig,
          mavenCachingOpts,
          mavenHttpOpts
        )
    ).singleton(),

    // cli
    mvnProcess: asFunction(
      (mavenCachingOpts, logger) =>
        createProcessClient(
          mavenCachingOpts,
          logger.child({ namespace: 'maven mvn process' })
        )
    ).singleton(),

    mvnCli: asFunction(
      (mavenConfig, mvnProcess, logger) =>
        new MvnCli(
          mavenConfig,
          mvnProcess,
          logger.child({ namespace: 'maven mvn cli' })
        )
    ).singleton(),

    // clients
    mavenHttpClient: asFunction(
      (mavenCachingOpts, mavenHttpOpts, logger) =>
        createHttpClient(
          {
            caching: mavenCachingOpts,
            http: mavenHttpOpts
          },
          logger.child({ namespace: 'maven request' })
        )
    ).singleton(),

    mavenClient: asFunction(
      (mavenConfig, mavenHttpClient, logger) =>
        new MavenClient(
          mavenConfig,
          mavenHttpClient,
          logger.child({ namespace: 'maven client' })
        )
    ).singleton(),

    // provider
    mavenProvider: asFunction(
      (mvnCli, mavenClient, logger) =>
        new MavenSuggestionProvider(
          mvnCli,
          mavenClient,
          logger.child({ namespace: 'maven provider' })
        )
    ).singleton(),
  };

  container.register(services);

  return container.cradle.mavenProvider;
}