import { ICachingOptions } from 'domain/caching';
import { IFrozenOptions } from 'domain/configuration';
import { IHttpOptions } from 'domain/http';
import { ProviderSupport } from './eProviderSupport';
import { TProviderFileMatcher } from './tProviderFileMatcher';

export interface IProviderConfig {

  config: IFrozenOptions;

  providerName: string;

  supports: Array<ProviderSupport>;

  fileMatcher: TProviderFileMatcher;

  caching: ICachingOptions;

  http: IHttpOptions;

  onSaveChangesTask: string;

}