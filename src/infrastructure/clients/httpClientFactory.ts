import {
  HttpRequestOptions,
  IHttpClient,
  IJsonHttpClient,
  JsonHttpClient
} from "domain/clients";
import { ILogger } from "domain/logging";
import { HttpClient } from "./httpClient";

export function createHttpClient(
  options: HttpRequestOptions, logger: ILogger
): IHttpClient {
  return new HttpClient(require('request-light').xhr, options, logger);
}

export function createJsonClient(
  options: HttpRequestOptions, logger: ILogger
): IJsonHttpClient {
  return new JsonHttpClient(createHttpClient(options, logger));
}