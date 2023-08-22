import { throwNull, throwUndefined } from '@esm-test/guards';
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
    throwUndefined("providerName", <any>providerName);
    throwNull("providerName", <any>providerName);

    throwUndefined("config", config);
    throwNull("config", config);

    throwUndefined("caching", caching);
    throwNull("caching", caching);

    throwUndefined("http", http);
    throwNull("http", http);

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