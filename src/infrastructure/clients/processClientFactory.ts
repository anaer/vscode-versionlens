import { IProcessClient, ICachingOptions } from "domain/clients";
import { ILogger } from "domain/logging";
import { ProcessClient } from "./processClient";

export function createProcessClient(
  cachingOpts: ICachingOptions, logger: ILogger
): IProcessClient {

  return new ProcessClient(require('@npmcli/promise-spawn'), cachingOpts, logger);
}

