import {
  ICachingOptions,
  IHttpOptions,
  IJsonHttpClient
} from 'domain/clients';
import { DubClient } from '../dubClient';
import { DubConfig } from '../dubConfig';

export interface IDubServices {

  dubCachingOpts: ICachingOptions;

  dubHttpOpts: IHttpOptions;

  dubConfig: DubConfig;

  dubJsonClient: IJsonHttpClient;

  dubClient: DubClient;

}