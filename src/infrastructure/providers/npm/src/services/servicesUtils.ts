import { CachingOptions, HttpOptions } from "domain/clients";
import { IServiceCollection } from "domain/di";
import { DomainService } from "domain/services/domainService";
import { nameOf } from "domain/utils";
import { createJsonClient } from "infrastructure/http";
import { GitHubClient } from '../clients/githubClient';
import { NpmPackageClient } from '../clients/npmPackageClient';
import { PacoteClient } from '../clients/pacoteClient';
import { NpmContributions } from '../definitions/eNpmContributions';
import { NpmConfig } from '../npmConfig';
import { NpmSuggestionProvider } from "../npmSuggestionProvider";
import { GitHubOptions } from '../options/githubOptions';
import { NpmService } from "./npmService";

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<NpmService>().npmCachingOpts,
    (container: DomainService) =>
      new CachingOptions(
        container.appConfig,
        NpmContributions.Caching,
        'caching'
      )
  );
}

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<NpmService>().npmHttpOpts,
    (container: DomainService) =>
      new HttpOptions(
        container.appConfig,
        NpmContributions.Http,
        'http'
      )
  );
}

export function addGithubOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<NpmService>().npmGitHubOpts,
    (container: DomainService) =>
      new GitHubOptions(
        container.appConfig,
        NpmContributions.Github,
        'github'
      )
  );
}

export function addNpmConfig(services: IServiceCollection) {
  services.addSingleton(
    nameOf<NpmService>().npmConfig,
    (container: NpmService & DomainService) =>
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
    nameOf<NpmService>().githubJsonClient,
    (container: NpmService & DomainService) =>
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
    nameOf<NpmService>().githubClient,
    (container: NpmService & DomainService) =>
      new GitHubClient(
        container.npmConfig,
        container.githubJsonClient,
        container.logger.child({ namespace: 'npm github' })
      )
  );
}

export function addPacoteClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<NpmService>().pacoteClient,
    (container: NpmService & DomainService) =>
      new PacoteClient(
        container.npmConfig,
        container.logger.child({ namespace: 'npm pacote' })
      )
  );
}

export function addNpmPackageClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<NpmService>().npmClient,
    (container: NpmService & DomainService) =>
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
    nameOf<DomainService>().suggestionProvider,
    (container: NpmService & DomainService) =>
      new NpmSuggestionProvider(
        container.npmClient,
        container.logger.child({ namespace: 'npm provider' })
      )
  );
}
