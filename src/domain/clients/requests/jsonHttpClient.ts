import { KeyStringDictionary } from 'domain/generics';

import {
  HttpClientResponse,
  JsonClientResponse,
  HttpClientRequestMethods,
  IJsonHttpClient,
  IHttpClient
} from 'domain/clients';

export class JsonHttpClient implements IJsonHttpClient {

  httpClient: IHttpClient;

  constructor(httpClient: IHttpClient) {
    this.httpClient = httpClient;
  }

  clearCache() {
    this.httpClient.clearCache();
  }

  async request(
    method: HttpClientRequestMethods,
    url: string,
    query: KeyStringDictionary = {},
    headers: KeyStringDictionary = {}
  ): Promise<JsonClientResponse> {

    return this.httpClient.request(method, url, query, headers)
      .then(function (response: HttpClientResponse) {
        return {
          source: response.source,
          status: response.status,
          data: JSON.parse(response.data),
        }
      });

  }

}