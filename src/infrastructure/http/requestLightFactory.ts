import {
  HttpRequestOptions,
  IHttpClient,
  IJsonHttpClient,
  JsonHttpClient
} from "domain/clients";
import { ILogger } from "domain/logging";
import { RequestLightClient } from "./requestLightClient";

export function createHttpClient(
  options: HttpRequestOptions, logger: ILogger
): IHttpClient {
  return new RequestLightClient(require('request-light').xhr, options, logger);
}

export function createJsonClient(
  options: HttpRequestOptions, logger: ILogger
): IJsonHttpClient {
  return new JsonHttpClient(createHttpClient(options, logger));
}