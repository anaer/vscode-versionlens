import { throwNull, throwUndefined } from "@esm-test/guards";
import { IExpiryCache, MemoryCache } from "domain/caching";
import { ILogger } from "domain/logging";
import {
  IPackageClient,
  PackageDependency,
  PackageResponse,
  ResponseFactory,
  TPackageClientRequest,
  TPackageClientResponse
} from "domain/packages";

export class SuggestionProvider<
  TClient extends IPackageClient<TClientData>,
  TClientData
> {

  constructor(
    readonly client: TClient,
    readonly suggestionCache: IExpiryCache,
    readonly logger: ILogger
  ) {
    throwUndefined("client", client);
    throwNull("client", client);

    throwUndefined("suggestionCache", suggestionCache);
    throwNull("suggestionCache", suggestionCache);

    throwUndefined("logger", logger);
    throwNull("logger", logger);
  }

  get name() {
    return this.client.config.providerName;
  }

  /**
   * Called before queueing all package fetch requests.
   * Providers can return custom client data that will be sent with each fetchPackage request
   * @param packagePath 
   */
  protected preFetchSuggestions?(
    projectPath: string,
    packagePath: string
  ): Promise<TClientData>;

  async fetchSuggestions(
    projectPath: string,
    packagePath: string,
    dependencies: Array<PackageDependency>,
  ): Promise<Array<PackageResponse>> {

    // get any client data if implemented
    let clientData: any = {};
    if (this.preFetchSuggestions) {
      clientData = await this.preFetchSuggestions(projectPath, packagePath);
    }

    this.logger.debug("Queuing %s package fetch tasks", dependencies.length);

    // queue package fetch tasks
    const promises = [];
    for (const dependency of dependencies) {
      // setup the client request
      const clientRequest: TPackageClientRequest<TClientData> = {
        providerName: this.name,
        clientData,
        dependency,
        attempt: 0
      };

      // get the fetch task
      const promisedFetch = this.fetchPackage(clientRequest);

      // queue the fetch task
      promises.push(promisedFetch);
    }

    // capture start time
    const startedAt = performance.now();

    // parallel the all fetch requests
    const responses: Array<PackageResponse> = await Promise.all(promises);

    // report completed duration
    const completedAt = performance.now();
    this.logger.info(
      'All packages fetched for %s (%s ms)',
      this.client.config.providerName,
      Math.floor(completedAt - startedAt)
    );

    // flatten results
    return responses.flat();
  }

  async fetchPackage(request: TPackageClientRequest<TClientData>): Promise<Array<PackageResponse>> {
    const providerName = this.name;
    const client = this.client;
    const requestedPackage = request.dependency.package;

    this.logger.silly("Fetching %s", requestedPackage.name);

    // create the cache key
    const cacheKey = MemoryCache.createKey(
      providerName,
      request.dependency.package.name,
      request.dependency.package.version
    );

    let source = "cache";
    let response: TPackageClientResponse;
    try {
      // capture start time
      const startedAt = performance.now();

      // fetch the package
      response = await this.suggestionCache.getOrCreate<TPackageClientResponse>(
        cacheKey,
        async () => {
          source = "client";
          return await client.fetchPackage(request)
        },
        this.client.config.caching.duration
      );

      // report completed duration
      const completedAt = performance.now();
      this.logger.info(
        'Fetched from %s %s@%s (%s ms)',
        source,
        requestedPackage.name,
        requestedPackage.version,
        Math.floor(completedAt - startedAt)
      );

    } catch (error) {
      // unexpected error
      this.logger.error(
        `%s caught an exception.\n Package: %j\n Error: %j`,
        this.fetchPackage.name,
        requestedPackage,
        error
      );

      throw error;
    }

    // client handled error responses
    if (response.responseStatus?.rejected) {
      this.logger.error(
        "%s@%s was rejected with the status code %s",
        requestedPackage.name,
        requestedPackage.version,
        response.responseStatus.status
      );
    }

    return ResponseFactory.createSuccess(
      providerName,
      request,
      response
    );
  }

}