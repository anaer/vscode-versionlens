import { throwNull, throwUndefined } from '@esm-test/guards';
import { ICachingOptions } from 'domain/caching';
import { IFrozenOptions } from 'domain/configuration';
import { IHttpOptions } from 'domain/http';
import { ProviderSupport } from 'domain/providers';

export abstract class AbstractProviderConfig {

  constructor(
    readonly providerName: string,
    readonly config: IFrozenOptions,
    readonly caching: ICachingOptions,
    readonly http: IHttpOptions
  ) {
    throwUndefined("providerName", <any>providerName);
    throwNull("providerName", <any>providerName);

    throwUndefined("config", config);
    throwNull("config", config);

    throwUndefined("caching", caching);
    throwNull("caching", caching);

    throwUndefined("http", http);
    throwNull("http", http);

    this.supports = [
      ProviderSupport.Releases,
      ProviderSupport.Prereleases,
    ];
  }

  supports: Array<ProviderSupport>;

}