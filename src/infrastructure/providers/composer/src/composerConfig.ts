import { ICachingOptions, IHttpOptions, UrlHelpers } from 'domain/clients';
import { IFrozenOptions } from 'domain/configuration';
import { IProviderConfig, TProviderFileMatcher } from 'domain/providers';
import { AbstractProviderConfig } from 'domain/providers/abstractProviderConfig';
import { ComposerContributions } from './definitions/eComposerContributions';

export class ComposerConfig extends AbstractProviderConfig implements IProviderConfig {

  constructor(
    config: IFrozenOptions,
    caching: ICachingOptions,
    http: IHttpOptions
  ) {
    super('composer', config, caching, http);
  }

  get fileMatcher(): TProviderFileMatcher {
    return {
      language: 'json',
      scheme: 'file',
      pattern: this.filePatterns,
    };
  }

  get filePatterns(): string {
    return this.config.get(ComposerContributions.FilePatterns);
  }

  get dependencyProperties(): Array<string> {
    return this.config.get(ComposerContributions.DependencyProperties);
  }

  get apiUrl(): string {
    return UrlHelpers.ensureEndSlash(this.config.get(ComposerContributions.ApiUrl));
  }

  get onSaveChangesTask(): string {
    return this.config.get(ComposerContributions.OnSaveChangesTask);
  }

}