import { ICachingOptions } from 'domain/caching';
import { IHttpOptions } from 'domain/http';
import { TProviderFileMatcher } from './tProviderFileMatcher';

export interface IProviderConfig {

  providerName: string;

  fileMatcher: TProviderFileMatcher;

  caching: ICachingOptions;

  http: IHttpOptions;

  onSaveChangesTask: string;

}