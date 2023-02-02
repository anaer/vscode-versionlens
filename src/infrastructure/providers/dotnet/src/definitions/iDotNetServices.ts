import {
  ICachingOptions,
  IHttpOptions,
  IJsonHttpClient,
  IProcessClient
} from 'domain/clients';
import { DotNetCli } from '../clients/dotnetCli';
import { NuGetPackageClient } from '../clients/nugetPackageClient';
import { NuGetResourceClient } from '../clients/nugetResourceClient';
import { DotNetConfig } from '../dotnetConfig';
import { DotNetSuggestionProvider } from '../dotnetSuggestionProvider';
import { NugetOptions } from '../options/nugetOptions';

export interface IDotNetServices {
  // options
  nugetOpts: NugetOptions,

  dotnetCachingOpts: ICachingOptions,

  dotnetHttpOpts: IHttpOptions,

  // config
  dotnetConfig: DotNetConfig,

  // cli
  dotnetProcess: IProcessClient,

  dotnetCli: DotNetCli,

  // clients
  dotnetJsonClient: IJsonHttpClient,

  nugetClient: NuGetPackageClient,

  nugetResClient: NuGetResourceClient,

  // provider
  dotnetProvider: DotNetSuggestionProvider

}