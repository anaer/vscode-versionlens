import { CachingOptions, HttpOptions, IJsonHttpClient } from "domain/clients";
import { GitHubClient } from '../clients/githubClient';
import { NpmPackageClient } from '../clients/npmPackageClient';
import { PacoteClient } from '../clients/pacoteClient';
import { NpmConfig } from '../npmConfig';
import { GitHubOptions } from '../options/githubOptions';

export interface INpmServices {
  npmCachingOpts: CachingOptions,
  npmHttpOpts: HttpOptions,
  npmGitHubOpts: GitHubOptions,
  npmConfig: NpmConfig,
  githubJsonClient: IJsonHttpClient,
  githubClient: GitHubClient,
  pacoteClient: PacoteClient,
  npmClient: NpmPackageClient
}