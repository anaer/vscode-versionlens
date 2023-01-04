import { ICachingOptions, IHttpOptions, IJsonHttpClient } from 'domain/clients';

import { JspmConfig } from '../jspmConfig';
import { JspmSuggestionProvider } from '../jspmSuggestionProvider'
import {
  GitHubOptions,
  PacoteClient,
  GitHubClient,
  NpmPackageClient
} from 'infrastructure/providers/npm';

export interface IJspmContainerMap {

  // config
  jspmConfig: JspmConfig,

  // options
  jspmCachingOpts: ICachingOptions,

  jspmHttpOpts: IHttpOptions,

  jspmGitHubOpts: GitHubOptions,

  // clients
  githubJsonClient: IJsonHttpClient,

  pacoteClient: PacoteClient,

  githubClient: GitHubClient,

  jspmClient: NpmPackageClient,

  // provider
  jspmProvider: JspmSuggestionProvider
}