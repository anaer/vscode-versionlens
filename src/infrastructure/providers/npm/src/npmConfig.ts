import { ICachingOptions, IHttpOptions } from 'domain/clients';
import { IFrozenOptions } from 'domain/configuration';
import { ProviderSupport, IProviderConfig, TProviderFileMatcher } from 'domain/providers';

import { GitHubOptions } from './options/githubOptions';
import { NpmContributions } from './definitions/eNpmContributions';

export class NpmConfig implements IProviderConfig {

  constructor(
    config: IFrozenOptions,
    caching: ICachingOptions,
    http: IHttpOptions,
    github: GitHubOptions,
  ) {
    this.config = config;
    this.caching = caching;
    this.http = http;
    this.github = github;
  }

  config: IFrozenOptions;

  providerName: string = 'npm';

  supports: Array<ProviderSupport> = [
    ProviderSupport.Releases,
    ProviderSupport.Prereleases,
    ProviderSupport.InstalledStatuses,
  ];

  fileMatcher: TProviderFileMatcher = {
    language: 'json',
    scheme: 'file',
    pattern: '**/package.json',
  };

  caching: ICachingOptions;

  http: IHttpOptions;

  github: GitHubOptions;

  get dependencyProperties(): Array<string> {
    return this.config.get(NpmContributions.DependencyProperties);
  }

  get distTagFilter(): Array<string> {
    return this.config.get(NpmContributions.DistTagFilter);
  }

  get allowEnvFiles(): boolean {
    return this.config.get(NpmContributions.AllowEnvFiles);
  }

}