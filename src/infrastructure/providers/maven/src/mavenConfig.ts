import { throwUndefinedOrNull } from '@esm-test/guards';
import { ICachingOptions } from 'domain/caching';
import { UrlHelpers } from 'domain/clients';
import { IFrozenOptions } from 'domain/configuration';
import { IHttpOptions } from 'domain/http';
import { IProviderConfig, TProviderFileMatcher } from 'domain/providers';
import { nameOf } from 'domain/utils';
import { MavenContributions } from './definitions/eMavenContributions';

const ctorParam = nameOf<MavenConfig>();

export class MavenConfig implements IProviderConfig {

  constructor(
    readonly config: IFrozenOptions,
    readonly caching: ICachingOptions,
    readonly http: IHttpOptions
  ) {
    throwUndefinedOrNull(ctorParam.config, config);
    throwUndefinedOrNull(ctorParam.caching, caching);
    throwUndefinedOrNull(ctorParam.http, http);
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

  get apiUrl(): string {
    return UrlHelpers.ensureEndSlash(this.config.get(MavenContributions.ApiUrl));
  }

  get onSaveChangesTask(): string {
    return this.config.get(MavenContributions.OnSaveChangesTask);
  }

  get prereleaseTagFilter(): Array<string> {
    return this.config.get(MavenContributions.prereleaseTagFilter);
  }

}