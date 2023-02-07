import { CachingOptions, HttpOptions, JsonHttpClient } from "domain/clients";
import { PubClient } from "../pubClient";
import { PubConfig } from "../pubConfig";

export interface PubService {
  pubCachingOpts: CachingOptions,
  pubHttpOpts: HttpOptions,
  pubConfig: PubConfig,
  pubJsonClient: JsonHttpClient,
  pubClient: PubClient
}