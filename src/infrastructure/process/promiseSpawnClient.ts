import { throwNull, throwUndefined } from '@esm-test/guards';
import { IExpiryCache } from 'domain/caching';
import {
  ClientResponse,
  ClientResponseSource,
  ICachingOptions,
  IProcessClient,
  ProcessClientResponse
} from 'domain/clients';
import { ILogger } from 'domain/logging';
import { IPromiseSpawnFn } from './iPromiseSpawn';

export class PromiseSpawnClient implements IProcessClient {

  constructor(
    readonly promiseSpawnFn: IPromiseSpawnFn,
    readonly processCache: IExpiryCache,
    readonly cachingOptions: ICachingOptions,
    readonly logger: ILogger
  ) {
    throwUndefined("promiseSpawnFn", promiseSpawnFn);
    throwNull("promiseSpawnFn", promiseSpawnFn);

    throwUndefined("processCache", processCache);
    throwNull("processCache", processCache);

    throwUndefined("cachingOptions", cachingOptions);
    throwNull("cachingOptions", cachingOptions);

    throwUndefined("logger", logger);
    throwNull("logger", logger);
  }

  async request(cmd: string, args: Array<string>, cwd: string): Promise<ProcessClientResponse> {
    const cacheKey = `${cmd} ${args.join(' ')}`;

    this.logger.silly('executing %s', cacheKey);

    try {
      let source = ClientResponseSource.cache;
      const result = await this.processCache.getOrCreate(
        cacheKey,
        async () => {
          source = ClientResponseSource.cli;
          return await this.promiseSpawnFn(cmd, args, { cwd, stdioString: true })
        },
        this.cachingOptions.duration
      )

      this.logger.debug("command result from %s - '%s'", source, cacheKey);

      return <ClientResponse<string, string>>{
        data: result.stdout,
        source,
        status: result.code,
        rejected: false
      };

    } catch (error) {

      const result = <ClientResponse<string, string>>{
        data: error.message,
        source: ClientResponseSource.cli,
        status: error.code,
        rejected: true
      };

      throw result;
    }

  }

}