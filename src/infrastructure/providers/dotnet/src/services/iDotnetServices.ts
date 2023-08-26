import { CachingOptions } from "domain/caching";
import { HttpOptions, IJsonHttpClient, IProcessClient } from "domain/clients";
import {
  DotNetCli,
  NuGetPackageClient,
  NuGetResourceClient,
  NugetOptions
} from "../..";
import { DotNetConfig } from "../dotnetConfig";

export interface IDotNetServices {

  dotnetCachingOpts: CachingOptions;

  dotnetHttpOpts: HttpOptions;

  nugetOpts: NugetOptions;

  dotnetConfig: DotNetConfig;

  dotnetProcess: IProcessClient;

  dotnetCli: DotNetCli;

  dotnetJsonClient: IJsonHttpClient;

  nugetClient: NuGetPackageClient;

  nugetResClient: NuGetResourceClient;

}