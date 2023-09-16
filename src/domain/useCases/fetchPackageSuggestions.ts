import { throwUndefinedOrNull } from "@esm-test/guards";
import { ILogger } from "domain/logging";
import {
  IPackageClient,
  PackageCache,
  PackageResponse,
  ResponseFactory,
  TPackageClientRequest,
  TPackageClientResponse
} from "domain/packages";
import { ISuggestionProvider } from "domain/suggestions";

export class FetchPackageSuggestions {

  constructor(
    private readonly packageCache: PackageCache,
    private readonly logger: ILogger
  ) {
    throwUndefinedOrNull("packageCache", packageCache);
    throwUndefinedOrNull("logger", logger);
  }

  async execute(
    provider: ISuggestionProvider,
    request: TPackageClientRequest<any>
  ): Promise<Array<PackageResponse>> {
    const providerName = provider.name;
    const requestedPackage = request.dependency.package;

    // capture start time
    const startedAt = performance.now();

    // get the package from the client or the cache
    let source = "cache";
    const response = await this.packageCache.getOrCreate(
      providerName,
      requestedPackage,
      async () => {
        source = "client";
        return await this.fetchPackage(provider.client, request);
      },
      provider.config.caching.duration
    );

    // report completed duration
    const completedAt = performance.now();
    this.logger.info(
      'fetched from %s %s@%s (%s ms)',
      source,
      requestedPackage.name,
      requestedPackage.version,
      Math.floor(completedAt - startedAt)
    );

    return ResponseFactory.createSuccess(
      providerName,
      request,
      response
    );
  }

  async fetchPackage(
    client: IPackageClient<any>,
    request: TPackageClientRequest<any>
  ): Promise<TPackageClientResponse> {

    const requestedPackage = request.dependency.package;

    this.logger.silly("fetching %s", requestedPackage.name);

    let response: TPackageClientResponse;
    try {

      // fetch the package
      response = await client.fetchPackage(request);

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

    return response;
  }

}