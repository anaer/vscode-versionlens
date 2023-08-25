import { CachingOptions, HttpOptions } from "domain/clients";
import { IServiceCollection } from "domain/di";
import { IDomainServices, IProviderServices } from "domain/services";
import { nameOf } from "domain/utils";
import { createJsonClient } from "infrastructure/http";
import Pacote from 'pacote';
import { GitHubClient } from '../clients/githubClient';
import { NpmPackageClient } from '../clients/npmPackageClient';
import { PacoteClient } from '../clients/pacoteClient';
import { NpmContributions } from '../definitions/eNpmContributions';
import { NpmConfig } from '../npmConfig';
import { NpmSuggestionProvider } from "../npmSuggestionProvider";
import { GitHubOptions } from '../options/githubOptions';
import { INpmServices } from './iNpmServices';

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<INpmServices>().npmCachingOpts,
    (container: IDomainServices) =>
      new CachingOptions(
        container.appConfig,
        NpmContributions.Caching,
        'caching'
      )
  );
}

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<INpmServices>().npmHttpOpts,
    (container: IDomainServices) =>
      new HttpOptions(
        container.appConfig,
        NpmContributions.Http,
        'http'
      )
  );
}

export function addGithubOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<INpmServices>().npmGitHubOpts,
    (container: IDomainServices) =>
      new GitHubOptions(
        container.appConfig,
        NpmContributions.Github,
        'github'
      )
  );
}

export function addNpmConfig(services: IServiceCollection) {
  services.addSingleton(
    nameOf<INpmServices>().npmConfig,
    (container: INpmServices & IDomainServices) =>
      new NpmConfig(
        container.appConfig,
        container.npmCachingOpts,
        container.npmHttpOpts,
        container.npmGitHubOpts
      )
  );
}

export function addJsonClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<INpmServices>().githubJsonClient,
    (container: INpmServices & IDomainServices) =>
      createJsonClient(
        {
          caching: container.npmCachingOpts,
          http: container.npmHttpOpts
        },
        container.logger.child({ namespace: 'npm request' })
      )
  );
}

export function addGitHubClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<INpmServices>().githubClient,
    (container: INpmServices & IDomainServices) =>
      new GitHubClient(
        container.npmConfig,
        container.githubJsonClient,
        container.logger.child({ namespace: 'npm github' })
      )
  );
}

export function addPacoteClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<INpmServices>().pacoteClient,
    (container: INpmServices & IDomainServices) =>
      new PacoteClient(
        Pacote,
        container.npmConfig,
        container.logger.child({ namespace: 'npm pacote' })
      )
  );
}

export function addNpmPackageClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<INpmServices>().npmClient,
    (container: INpmServices & IDomainServices) =>
      new NpmPackageClient(
        container.npmConfig,
        container.pacoteClient,
        container.githubClient,
        container.logger.child({ namespace: 'npm client' })
      )
  );
}

export function addSuggestionProvider(services: IServiceCollection) {
  services.addScoped(
    nameOf<IProviderServices>().suggestionProvider,
    (container: INpmServices & IDomainServices) =>
      new NpmSuggestionProvider(
        container.npmClient,
        container.suggestionCache,
        container.logger.child({ namespace: 'npm provider' })
      )
  );
}