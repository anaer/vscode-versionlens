import { KeyStringDictionary } from "core/definitions/generics";
import { AbstractClientRequest } from './abstractClientRequest';
import { ClientResponse } from "../definitions/clientResponses";

type RequestLightHttpResponse = {
  status: number;
  responseText: string;
}

export enum HttpRequestMethods {
  get = 'GET',
  head = 'HEAD'
}

export type HttpClientResponse = ClientResponse<number, string>;

export class HttpRequest extends AbstractClientRequest<number, string> {

  headers: KeyStringDictionary;

  constructor(headers?: KeyStringDictionary, cacheDuration?: number) {
    super(cacheDuration);
    this.headers = headers || {};
  }
  
  async request(
    method: HttpRequestMethods,
    baseUrl: string,
    queryParams: KeyStringDictionary = {}
  ): Promise<HttpClientResponse> {

    const url = createUrl(baseUrl, queryParams);
    const cacheKey = method + '_' + url;

    if (this.cache.cacheDuration > 0 && this.cache.hasExpired(cacheKey) === false) {
      return Promise.resolve(this.cache.get(cacheKey));
    }

    const requestLight = require('request-light');
    return requestLight.xhr({
      url,
      type: method,
      headers: this.headers
    })
      .then((response: RequestLightHttpResponse) => {
        return this.createCachedResponse(
          cacheKey,
          response.status,
          response.responseText
        );
      })
      .catch((response: RequestLightHttpResponse) => {
        const result = this.createCachedResponse(
          cacheKey,
          response.status,
          response.responseText
        );
        return Promise.reject<HttpClientResponse>(result);
      });
  }

}

export function createUrl(baseUrl: string, queryParams: KeyStringDictionary): string {
  const query = buildQueryParams(queryParams);

  const slashedUrl = query.length > 0 ?
    stripEndSlash(baseUrl) :
    baseUrl;

  return slashedUrl + query;
}

function buildQueryParams(queryParams: KeyStringDictionary): string {
  let query = '';
  if (queryParams) {
    query = Object.keys(queryParams)
      .map(key => `${key}=${queryParams[key]}`)
      .join('&');
    query = (query.length > 0) ? '?' + query : '';
  }
  return query;
}

function stripEndSlash(url: string): string {
  return url.endsWith('/') ? url.substr(url.length - 1) : url;
}