import { CachingOptions, HttpOptions, IProcessClient, IHttpClient } from "domain/clients";
import { MvnCli, MavenClient } from "../../index";
import { MavenConfig } from "../mavenConfig";

export interface MavenService {
  mavenCachingOpts: CachingOptions,
  mavenHttpOpts: HttpOptions,
  mavenConfig: MavenConfig,
  mvnProcess: IProcessClient,
  mvnCli: MvnCli,
  mavenHttpClient: IHttpClient,
  mavenClient: MavenClient
}