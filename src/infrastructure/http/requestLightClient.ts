import { throwUndefinedOrNull } from '@esm-test/guards';
import {
  ClientResponseSource,
  HttpClientOptions,
  HttpClientRequestMethods,
  HttpClientResponse,
  IHttpClient,
  UrlHelpers
} from 'domain/clients';
import { KeyStringDictionary } from 'domain/generics';
import { ILogger } from 'domain/logging';
import { XHRRequest } from 'request-light';
import { IXhrResponse } from './iXhrResponse';

export class RequestLightClient implements IHttpClient {

  constructor(
    readonly xhr: XHRRequest,
    readonly options: HttpClientOptions,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("xhr", xhr);
    throwUndefinedOrNull("options", options);
    throwUndefinedOrNull("logger", logger);
  }

  async request(
    method: HttpClientRequestMethods,
    baseUrl: string,
    query: KeyStringDictionary = {},
    headers: KeyStringDictionary = {}
  ): Promise<HttpClientResponse> {

    const url = UrlHelpers.createUrl(baseUrl, query);

    try {
      // make the request
      const response = await this.xhr({
        url,
        type: method,
        headers,
        strictSSL: this.options.http.strictSSL
      });

      // return the response
      return <HttpClientResponse>{
        source: ClientResponseSource.remote,
        status: response.status,
        data: response.responseText,
        rejected: false
      };

    } catch (error) {
      const errorResponse = error as IXhrResponse;

      // throw the error response
      const result = <HttpClientResponse>{
        source: ClientResponseSource.remote,
        status: errorResponse.status,
        data: errorResponse.responseText,
        rejected: true
      };

      throw result;
    }

  }

}