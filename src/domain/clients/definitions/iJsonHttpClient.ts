import { KeyStringDictionary } from 'domain/generics';
import { JsonClientResponse } from './clientResponses';
import { HttpClientRequestMethods } from "./eHttpClientRequestMethods";
import { IHttpClient } from './iHttpClient';

export interface IJsonHttpClient {

  httpClient: IHttpClient;

  request: (
    method: HttpClientRequestMethods,
    url: string,
    query: KeyStringDictionary,
    headers: KeyStringDictionary,
  ) => Promise<JsonClientResponse>;

}