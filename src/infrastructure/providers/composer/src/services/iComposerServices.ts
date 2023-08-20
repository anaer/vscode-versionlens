import { CachingOptions, HttpOptions, IJsonHttpClient } from "domain/clients";
import { ComposerClient } from "../composerClient";
import { ComposerConfig } from "../composerConfig";

export interface IComposerService {
  composerCachingOpts: CachingOptions,
  composerHttpOpts: HttpOptions,
  composerConfig: ComposerConfig,
  composerJsonClient: IJsonHttpClient,
  composerClient: ComposerClient
}