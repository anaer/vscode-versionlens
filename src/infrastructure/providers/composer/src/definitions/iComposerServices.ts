import { ICachingOptions, IHttpOptions, IJsonHttpClient } from 'domain/clients';
import { ComposerConfig } from '../composerConfig';
import { ComposerSuggestionProvider } from '../composerSuggestionProvider';
import { ComposerClient } from '../composerClient';

export interface IComposerServices {

  // options
  composerCachingOpts: ICachingOptions,

  composerHttpOpts: IHttpOptions,

  // config
  composerConfig: ComposerConfig,

  // clients
  composerJsonClient: IJsonHttpClient,

  composerClient: ComposerClient,

  // provider
  composerProvider: ComposerSuggestionProvider

}