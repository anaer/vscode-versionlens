import { ICachingOptions, IHttpOptions, IJsonHttpClient } from 'domain/clients';
import { PubClient } from '../pubClient';
import { PubConfig } from '../pubConfig';
import { PubSuggestionProvider } from '../pubSuggestionProvider';

export interface IPubServices {

  // options
  pubCachingOpts: ICachingOptions,

  pubHttpOpts: IHttpOptions,

  // config
  pubConfig: PubConfig,

  // clients
  pubJsonClient: IJsonHttpClient,

  pubClient: PubClient,

  // provider
  pubProvider: PubSuggestionProvider

}