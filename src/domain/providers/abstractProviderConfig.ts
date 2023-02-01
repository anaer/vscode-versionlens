import { ICachingOptions, IHttpOptions } from 'domain/clients/index';
import { IFrozenOptions } from 'domain/configuration/index';
import { ProviderSupport } from 'domain/providers';

export abstract class AbstractProviderConfig {

  constructor(
    providerName: string,
    config: IFrozenOptions,
    caching: ICachingOptions,
    http: IHttpOptions
  ) {
    this.providerName = providerName;
    this.config = config;
    this.caching = caching;
    this.http = http;
    this.supports = [
      ProviderSupport.Releases,
      ProviderSupport.Prereleases,
    ];
  }

  providerName: string;

  config: IFrozenOptions;

  supports: Array<ProviderSupport>;

  caching: ICachingOptions;

  http: IHttpOptions;

}