import {
  AbstractCachedRequest,
  ClientResponseSource,
  ICachingOptions,
  IProcessClient,
  ProcessClientResponse
} from 'domain/clients';
import { ILogger } from 'domain/logging';
import { IPromiseSpawnFn } from './iPromiseSpawn';

export class PromiseSpawnClient extends AbstractCachedRequest<string, string>
  implements IProcessClient {

  constructor(
    promiseSpawnFn: IPromiseSpawnFn,
    processOpts: ICachingOptions,
    processLogger: ILogger
  ) {
    super(processOpts);
    this.logger = processLogger;
    this.promiseSpawn = promiseSpawnFn;
  }

  promiseSpawn: IPromiseSpawnFn;

  logger: ILogger;

  clearCache() {
    this.cache.clear();
  };

  async request(
    cmd: string,
    args: Array<string>,
    cwd: string
  ): Promise<ProcessClientResponse> {
    const cacheKey = `${cmd} ${args.join(' ')}`;

    // try to get from cache
    if (this.cache.cachingOpts.duration > 0 &&
      this.cache.hasExpired(cacheKey) === false) {
      this.logger.debug('cached - %s', cacheKey);

      const cachedResp = this.cache.get(cacheKey);
      if (cachedResp.rejected) throw cachedResp;
      return cachedResp;
    }

    this.logger.debug('executing - %s', cacheKey);

    try {
      const result = await this.promiseSpawn(cmd, args, { cwd, stdioString: true });

      return this.createCachedResponse(
        cacheKey,
        result.code,
        result.stdout,
        false,
        ClientResponseSource.local
      );
    } catch (error) {
      // cache the error response
      const result = this.createCachedResponse(
        cacheKey,
        error.code,
        error.message,
        true,
        ClientResponseSource.local
      );

      throw result;
    }

  }

}