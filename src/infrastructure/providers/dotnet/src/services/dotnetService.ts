import {
  CachingOptions,
  HttpOptions,
  IJsonHttpClient,
  IProcessClient
} from "domain/clients";
import {
  NugetOptions,
  DotNetCli,
  NuGetPackageClient,
  NuGetResourceClient
} from "../..";
import { DotNetConfig } from "../dotnetConfig";

export interface DotNetService {
  dotnetCachingOpts: CachingOptions,
  dotnetHttpOpts: HttpOptions,
  nugetOpts: NugetOptions,
  dotnetConfig: DotNetConfig,
  dotnetProcess: IProcessClient,
  dotnetCli: DotNetCli,
  dotnetJsonClient: IJsonHttpClient,
  nugetClient: NuGetPackageClient,
  nugetResClient: NuGetResourceClient
}