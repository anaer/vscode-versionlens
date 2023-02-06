import { CachingOptions, HttpOptions, IJsonHttpClient } from "domain/clients";
import { DubClient } from "../dubClient";
import { DubConfig } from "../dubConfig";
import { DubSuggestionProvider } from "../dubSuggestionProvider";

export interface DubService {
  dubCachingOpts: CachingOptions,
  dubHttpOpts: HttpOptions,
  dubConfig: DubConfig,
  dubJsonClient: IJsonHttpClient,
  dubClient: DubClient,
  dubSuggestionProvider: DubSuggestionProvider
}