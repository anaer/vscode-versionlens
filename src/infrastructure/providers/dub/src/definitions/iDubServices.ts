import {
  ICachingOptions,
  IHttpOptions,
  IJsonHttpClient
} from 'domain/clients';
import { DubClient } from '../dubClient';
import { DubConfig } from '../dubConfig';
import { DubSuggestionProvider } from '../dubSuggestionProvider';

export interface IDubServices {

  // options
  dubCachingOpts: ICachingOptions,

  dubHttpOpts: IHttpOptions,

  // config
  dubConfig: DubConfig,

  // clients
  dubJsonClient: IJsonHttpClient,

  dubClient: DubClient,

  // provider
  dubProvider: DubSuggestionProvider

}