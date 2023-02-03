import { ICachingOptions, IHttpOptions } from 'domain/clients';
import { IFrozenOptions } from 'domain/configuration';
import { ProviderSupport } from './eProviderSupport';
import { TProviderFileMatcher } from './tProviderFileMatcher';

export interface IProviderConfig {

  config: IFrozenOptions;

  providerName: string;

  supports: Array<ProviderSupport>;

  fileMatcher: TProviderFileMatcher;

  caching: ICachingOptions;

  http: IHttpOptions;

}