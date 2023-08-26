import { CachingOptions } from "domain/caching";
import { HttpOptions, IJsonHttpClient } from "domain/clients";
import { ComposerClient } from "../composerClient";
import { ComposerConfig } from "../composerConfig";

export interface IComposerService {

  composerCachingOpts: CachingOptions;

  composerHttpOpts: HttpOptions;

  composerConfig: ComposerConfig;

  composerJsonClient: IJsonHttpClient;

  composerClient: ComposerClient;

}