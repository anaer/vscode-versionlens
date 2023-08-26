import { ICachingOptions } from 'domain/caching';
import { IFrozenOptions } from 'domain/configuration';
import { IHttpOptions } from 'domain/http';
import { IProviderConfig, TProviderFileMatcher } from 'domain/providers';
import { AbstractProviderConfig } from 'domain/providers/abstractProviderConfig';
import { DotNetContributions } from './definitions/eDotNetContributions';
import { INugetOptions } from "./definitions/iNugetOptions";

export class DotNetConfig extends AbstractProviderConfig implements IProviderConfig {

  constructor(
    config: IFrozenOptions,
    caching: ICachingOptions,
    http: IHttpOptions,
    nugetOpts: INugetOptions,
  ) {
    super('dotnet', config, caching, http);
    this.nuget = nugetOpts;
  }

  nuget: INugetOptions;

  get fileMatcher(): TProviderFileMatcher {
    return {
      language: 'xml',
      scheme: 'file',
      pattern: this.filePatterns,
    };
  }

  get filePatterns(): string {
    return this.config.get(DotNetContributions.FilePatterns);
  }

  get dependencyProperties(): Array<string> {
    return this.config.get(DotNetContributions.DependencyProperties);
  }

  get fallbackNugetSource(): string {
    return 'https://api.nuget.org/v3/index.json';
  }

  get onSaveChangesTask(): string {
    return this.config.get(DotNetContributions.OnSaveChangesTask);
  }

  get prereleaseTagFilter(): Array<string> {
    return this.config.get(DotNetContributions.PrereleaseTagFilter);
  }

}