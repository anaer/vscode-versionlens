import { ICachingOptions, IHttpOptions, UrlHelpers } from 'domain/clients';
import { IFrozenOptions } from 'domain/configuration';
import { IProviderConfig, TProviderFileMatcher } from 'domain/providers';
import { AbstractProviderConfig } from 'domain/providers/abstractProviderConfig';
import { PubContributions } from './definitions/ePubContributions';

export class PubConfig extends AbstractProviderConfig implements IProviderConfig {

  constructor(
    config: IFrozenOptions,
    caching: ICachingOptions,
    http: IHttpOptions
  ) {
    super('pub', config, caching, http);
  }

  get fileMatcher(): TProviderFileMatcher {
    return {
      language: 'yaml',
      scheme: 'file',
      pattern: this.filePatterns,
    };
  }

  get filePatterns(): string {
    return this.config.get(PubContributions.FilePatterns);
  }

  get dependencyProperties(): Array<string> {
    return this.config.get(PubContributions.DependencyProperties);
  }

  get apiUrl(): string {
    return UrlHelpers.ensureEndSlash(this.config.get(PubContributions.ApiUrl));
  }

  get onSaveChangesTask(): string {
    return this.config.get(PubContributions.OnSaveChangesTask);
  }

}