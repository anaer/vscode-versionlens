import { CachingOptions, HttpOptions, IJsonHttpClient } from "domain/clients";
import { DubClient } from "../dubClient";
import { DubConfig } from "../dubConfig";

export interface IDubServices {

  dubCachingOpts: CachingOptions;

  dubHttpOpts: HttpOptions;

  dubConfig: DubConfig;

  dubJsonClient: IJsonHttpClient;

  dubClient: DubClient;

}