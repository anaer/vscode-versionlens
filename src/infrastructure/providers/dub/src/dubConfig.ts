import { ICachingOptions } from 'domain/caching';
import { UrlHelpers } from 'domain/clients';
import { IFrozenOptions } from 'domain/configuration';
import { IHttpOptions } from 'domain/http';
import { IProviderConfig, TProviderFileMatcher } from 'domain/providers';
import { AbstractProviderConfig } from 'domain/providers/abstractProviderConfig';
import { DubContributions } from './definitions/eDubContributions';

export class DubConfig extends AbstractProviderConfig implements IProviderConfig {

  constructor(
    config: IFrozenOptions,
    caching: ICachingOptions,
    http: IHttpOptions
  ) {
    super('dub', config, caching, http);
  }

  get fileMatcher(): TProviderFileMatcher {
    return {
      language: 'json',
      scheme: 'file',
      pattern: this.filePatterns,
    };
  }

  get filePatterns(): string {
    return this.config.get(DubContributions.FilePatterns);
  }

  get dependencyProperties(): Array<string> {
    return this.config.get(DubContributions.DependencyProperties);
  }

  get apiUrl(): string {
    return UrlHelpers.ensureEndSlash(this.config.get(DubContributions.ApiUrl));
  }

  get onSaveChangesTask(): string {
    return this.config.get(DubContributions.OnSaveChangesTask);
  }

  get prereleaseTagFilter(): Array<string> {
    return this.config.get(DubContributions.prereleaseTagFilter);
  }

}