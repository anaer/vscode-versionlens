import { ICachingOptions, IHttpOptions } from 'domain/clients';
import { IFrozenOptions } from 'domain/configuration';
import { IProviderConfig, TProviderFileMatcher } from 'domain/providers';
import { AbstractProviderConfig } from 'domain/providers/abstractProviderConfig';
import { NpmContributions } from './definitions/eNpmContributions';
import { GitHubOptions } from './options/githubOptions';

export class NpmConfig extends AbstractProviderConfig implements IProviderConfig {

  constructor(
    config: IFrozenOptions,
    caching: ICachingOptions,
    http: IHttpOptions,
    github: GitHubOptions,
  ) {
    super('npm', config, caching, http);
    this.github = github;
  }

  github: GitHubOptions;

  get fileMatcher(): TProviderFileMatcher {
    return {
      language: 'json',
      scheme: 'file',
      pattern: this.filePatterns,
    };
  }

  get filePatterns(): string {
    return this.config.get(NpmContributions.FilePatterns);
  }

  get dependencyProperties(): Array<string> {
    return this.config.get(NpmContributions.DependencyProperties);
  }

  get distTagFilter(): Array<string> {
    return this.config.get(NpmContributions.DistTagFilter);
  }

}