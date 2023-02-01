import { ICachingOptions, IHttpOptions, UrlHelpers } from 'domain/clients';
import { IFrozenOptions } from 'domain/configuration';
import { IProviderConfig, TProviderFileMatcher } from 'domain/providers';
import { AbstractProviderConfig } from 'domain/providers/abstractProviderConfig';
import { MavenContributions } from './definitions/eMavenContributions';

export class MavenConfig extends AbstractProviderConfig implements IProviderConfig {

  constructor(
    config: IFrozenOptions,
    caching: ICachingOptions,
    http: IHttpOptions
  ) {
    super('maven', config, caching, http);
  }

  get fileMatcher(): TProviderFileMatcher {
    return {
      language: 'xml',
      scheme: 'file',
      pattern: this.filePatterns,
    };
  }

  get filePatterns(): string {
    return this.config.get(MavenContributions.FilePatterns);
  }

  get dependencyProperties(): Array<string> {
    return this.config.get(MavenContributions.DependencyProperties);
  }

  get tagFilter(): Array<string> {
    return this.config.get(MavenContributions.DependencyProperties);
  }

  get apiUrl(): string {
    return UrlHelpers.ensureEndSlash(this.config.get(MavenContributions.ApiUrl));
  }

}