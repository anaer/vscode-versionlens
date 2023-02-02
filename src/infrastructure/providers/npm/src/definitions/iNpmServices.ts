import { ICachingOptions, IHttpOptions, IJsonHttpClient } from 'domain/clients';
import { GitHubClient } from '../clients/githubClient';
import { NpmPackageClient } from '../clients/npmPackageClient';
import { PacoteClient } from '../clients/pacoteClient';
import { NpmConfig } from '../npmConfig';
import { NpmSuggestionProvider } from '../npmSuggestionProvider';
import { GitHubOptions } from '../options/githubOptions';

export interface INpmServices {

  // config
  npmConfig: NpmConfig,

  // options
  npmCachingOpts: ICachingOptions,

  npmHttpOpts: IHttpOptions,

  npmGitHubOpts: GitHubOptions,

  // clients
  githubJsonClient: IJsonHttpClient,

  pacoteClient: PacoteClient,

  githubClient: GitHubClient,

  npmClient: NpmPackageClient,

  // provider
  npmProvider: NpmSuggestionProvider
}