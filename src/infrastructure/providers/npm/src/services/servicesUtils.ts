import { CachingOptions, HttpOptions } from "domain/clients";
import { IServiceCollection } from "domain/di";
import { DomainService } from "domain/services/eDomainService";
import { createJsonClient } from "infrastructure/http";
import { GitHubClient } from '../clients/githubClient';
import { NpmPackageClient } from '../clients/npmPackageClient';
import { PacoteClient } from '../clients/pacoteClient';
import { NpmContributions } from '../definitions/eNpmContributions';
import { NpmConfig } from '../npmConfig';
import { NpmSuggestionProvider } from "../npmSuggestionProvider";
import { GitHubOptions } from '../options/githubOptions';
import { NpmService } from "./eNpmService";

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    NpmService.npmCachingOpts,
    appConfig => new CachingOptions(
      appConfig,
      NpmContributions.Caching,
      'caching'
    )
  );
}

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    NpmService.npmHttpOpts,
    appConfig => new HttpOptions(
      appConfig,
      NpmContributions.Http,
      'http'
    )
  );
}

export function addGithubOptions(services: IServiceCollection) {
  services.addSingleton(
    NpmService.npmGitHubOpts,
    appConfig => new GitHubOptions(
      appConfig,
      NpmContributions.Github,
      'github'
    )
  );
}

export function addNpmConfig(services: IServiceCollection) {
  services.addSingleton(
    NpmService.npmConfig,
    (appConfig, npmCachingOpts, npmHttpOpts, npmGitHubOpts) =>
      new NpmConfig(appConfig, npmCachingOpts, npmHttpOpts, npmGitHubOpts)
  );
}

export function addJsonClient(services: IServiceCollection) {
  services.addSingleton(
    NpmService.githubJsonClient,
    (npmCachingOpts, npmHttpOpts, logger) =>
      createJsonClient(
        {
          caching: npmCachingOpts,
          http: npmHttpOpts
        },
        logger.child({ namespace: 'npm request' })
      )
  );
}

export function addGitHubClient(services: IServiceCollection) {
  services.addSingleton(
    NpmService.githubClient,
    (npmConfig, githubJsonClient, logger) =>
      new GitHubClient(
        npmConfig,
        githubJsonClient,
        logger.child({ namespace: 'npm github' })
      )
  );
}

export function addPacoteClient(services: IServiceCollection) {
  services.addSingleton(
    NpmService.pacoteClient,
    (npmConfig, logger) =>
      new PacoteClient(
        npmConfig,
        logger.child({ namespace: 'npm pacote' })
      )
  );
}

export function addNpmPackageClient(services: IServiceCollection) {
  services.addSingleton(
    NpmService.npmClient,
    (npmConfig, githubClient, pacoteClient, logger) =>
      new NpmPackageClient(
        npmConfig,
        pacoteClient,
        githubClient,
        logger.child({ namespace: 'npm client' })
      )
  );
}

export function addSuggestionProvider(services: IServiceCollection) {
  services.addSingleton(
    `npm${DomainService.suggestionProvider}`,
    (npmClient, logger) =>
      new NpmSuggestionProvider(
        npmClient,
        logger.child({ namespace: 'npm provider' })
      )
  );
}
