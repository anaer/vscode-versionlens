import { CachingOptions } from "domain/caching";
import { HttpOptions, IHttpClient, IProcessClient } from "domain/clients";
import { MavenClient, MvnCli } from "../../index";
import { MavenConfig } from "../mavenConfig";

export interface IMavenServices {

  mavenCachingOpts: CachingOptions;

  mavenHttpOpts: HttpOptions;

  mavenConfig: MavenConfig;

  mvnProcess: IProcessClient;

  mvnCli: MvnCli;

  mavenHttpClient: IHttpClient;

  mavenClient: MavenClient;

}