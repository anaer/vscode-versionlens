import { throwNotStringOrEmpty, throwUndefinedOrNull } from '@esm-test/guards';
import { ICachingOptions } from 'domain/caching';
import { IFrozenOptions } from 'domain/configuration';
import { IHttpOptions } from 'domain/http';

export abstract class AbstractProviderConfig {

  constructor(
    readonly providerName: string,
    readonly config: IFrozenOptions,
    readonly caching: ICachingOptions,
    readonly http: IHttpOptions
  ) {
    throwNotStringOrEmpty("providerName", providerName);
    throwUndefinedOrNull("config", config);
    throwUndefinedOrNull("caching", caching);
    throwUndefinedOrNull("http", http);
  }

}