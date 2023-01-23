import { IProcessClient, ICachingOptions } from "domain/clients";
import { ILogger } from "domain/logging";
import { PromiseSpawnClient } from "./promiseSpawnClient";

export function createProcessClient(
  cachingOpts: ICachingOptions, logger: ILogger
): IProcessClient {

  return new PromiseSpawnClient(require('@npmcli/promise-spawn'), cachingOpts, logger);
}

