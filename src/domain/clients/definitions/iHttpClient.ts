import { KeyStringDictionary } from 'domain/utils';
import { HttpClientResponse } from "./clientResponses";
import { HttpClientRequestMethods } from "./eHttpClientRequestMethods";

export interface THttpClientRequestFn {
  (
    method: HttpClientRequestMethods,
    url: string,
    query: KeyStringDictionary,
    headers: KeyStringDictionary,
  ): Promise<HttpClientResponse>;
}

export interface IHttpClient {

  request: THttpClientRequestFn;

}
