import { KeyStringDictionary } from 'domain/generics';

import { HttpClientRequestMethods } from "./eHttpClientRequestMethods";
import { JsonClientResponse } from './clientResponses';
import { IHttpClient } from './iHttpClient';

export interface TJsonClientRequestFn {

  (
    method: HttpClientRequestMethods,
    url: string,
    query: KeyStringDictionary,
    headers: KeyStringDictionary,
  ): Promise<JsonClientResponse>;

}

export interface IJsonHttpClient {

  httpClient: IHttpClient;

  clearCache: () => void;

  request: TJsonClientRequestFn;

}