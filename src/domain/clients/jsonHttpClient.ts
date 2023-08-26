import {
  HttpClientRequestMethods,
  HttpClientResponse,
  IHttpClient,
  IJsonHttpClient,
  JsonClientResponse
} from 'domain/clients';
import { KeyStringDictionary } from 'domain/generics';

export class JsonHttpClient implements IJsonHttpClient {

  constructor(readonly httpClient: IHttpClient) {
    this.httpClient = httpClient;
  }

  request(
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