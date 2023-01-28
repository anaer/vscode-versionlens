import PromiseSpawn from '@npmcli/promise-spawn';
import { ICachingOptions, IProcessClient } from 'domain/clients';
import { ILogger } from 'domain/logging';
import { PromiseSpawnClient } from './promiseSpawnClient';

export function createProcessClient(
  cachingOpts: ICachingOptions, logger: ILogger
): IProcessClient {

  return new PromiseSpawnClient(PromiseSpawn, cachingOpts, logger);
}

