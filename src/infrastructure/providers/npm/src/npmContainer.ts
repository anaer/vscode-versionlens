import { AwilixContainer, asFunction } from 'awilix';

import { CachingOptions, HttpOptions } from 'domain/clients';
import { ISuggestionProvider } from 'domain/suggestions';

import { createJsonClient } from 'infrastructure/http';

import { NpmContributions } from './definitions/eNpmContributions';
import { INpmServices } from './definitions/iNpmServices';
import { GitHubOptions } from './options/githubOptions';
import { NpmPackageClient } from './clients/npmPackageClient';
import { PacoteClient } from './clients/pacoteClient';
import { GitHubClient } from './clients/githubClient';
import { NpmSuggestionProvider } from './npmSuggestionProvider'
import { NpmConfig } from './npmConfig';

export function configureContainer(
  container: AwilixContainer<INpmServices>
): ISuggestionProvider {

  const services = {

    // options
    npmCachingOpts: asFunction(
      appConfig => new CachingOptions(
        appConfig,
        NpmContributions.Caching,
        'caching'
      )
    ).singleton(),

    npmHttpOpts: asFunction(
      appConfig => new HttpOptions(
        appConfig,
        NpmContributions.Http,
        'http'
      )
    ).singleton(),

    npmGitHubOpts: asFunction(
      appConfig => new GitHubOptions(
        appConfig,
        NpmContributions.Github,
        'github'
      )
    ).singleton(),

    // config
    npmConfig: asFunction(
      (appConfig, npmCachingOpts, npmHttpOpts, npmGitHubOpts) =>
        new NpmConfig(appConfig, npmCachingOpts, npmHttpOpts, npmGitHubOpts)
    ).singleton(),

    // clients
    githubJsonClient: asFunction(
      (npmCachingOpts, npmHttpOpts, logger) =>
        createJsonClient(
          {
            caching: npmCachingOpts,
            http: npmHttpOpts
          },
          logger.child({ namespace: 'npm request' })
        )
    ).singleton(),

    githubClient: asFunction(
      (npmConfig, githubJsonClient, logger) =>
        new GitHubClient(
          npmConfig,
          githubJsonClient,
          logger.child({ namespace: 'npm github' })
        )
    ).singleton(),

    pacoteClient: asFunction(
      (npmConfig, logger) =>
        new PacoteClient(
          npmConfig,
          logger.child({ namespace: 'npm pacote' })
        )
    ).singleton(),

    npmClient: asFunction(
      (npmConfig, githubClient, pacoteClient, logger) =>
        new NpmPackageClient(
          npmConfig,
          pacoteClient,
          githubClient,
          logger.child({ namespace: 'npm client' })
        )
    ).singleton(),

    // provider
    npmProvider: asFunction(
      (npmClient, logger) =>
        new NpmSuggestionProvider(
          npmClient,
          logger.child({ namespace: 'npm provider' })
        )
    ).singleton(),

  };

  container.register(services);

  return container.cradle.npmProvider;
}