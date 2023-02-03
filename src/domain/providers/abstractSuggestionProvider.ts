import { ILogger } from "domain/logging";
import {
  IPackageClient,
  PackageDependency,
  PackageResponse,
  ResponseFactory,
  TPackageClientRequest,
  TPackageClientResponse
} from "domain/packages";
import { IProviderConfig } from "./index";

export abstract class AbstractSuggestionProvider<T extends IProviderConfig> {

  constructor(config: T, logger: ILogger) {
    this.config = config;
    this.logger = logger;
  }

  config: T;

  logger: ILogger;

  async fetchPackages<TClientData>(
    client: IPackageClient<TClientData>,
    clientData: TClientData,
    dependencies: Array<PackageDependency>,
  ): Promise<Array<PackageResponse>> {

    const { providerName } = client.config;

    const results: PackageResponse[] = [];

    for (const dependency of dependencies) {
      // build the client request
      const clientRequest: TPackageClientRequest<TClientData> = {
        providerName,
        clientData,
        dependency,
        attempt: 0
      };

      // execute request
      results.push.apply(
        results,
        await this.fetchPackage(
          client,
          clientRequest
        )
      );
    }

    return results;
  }

  fetchPackage<TClientData>(
    client: IPackageClient<TClientData>,
    request: TPackageClientRequest<TClientData>,
  ): Promise<Array<PackageResponse>> {
    const requestedPackage = request.dependency.package;
    client.logger.debug("Queued package: %s", requestedPackage.name);

    const startedAt = performance.now();

    return client.fetchPackage(request)
      .then(function (document: TPackageClientResponse) {
        const completedAt = performance.now();

        client.logger.info(
          'Fetched %s package from %s: %s@%s (%s ms)',
          client.config.providerName,
          document.responseStatus.source,
          requestedPackage.name,
          requestedPackage.version,
          Math.floor(completedAt - startedAt)
        );

        return ResponseFactory.createSuccess(
          client.config.providerName,
          request,
          document
        );
      })
      .catch(function (error: PackageResponse) {

        client.logger.error(
          `%s caught an exception.\n Package: %j\n Error: %j`,
          this.fetchPackage.name,
          requestedPackage,
          error
        );

        return Promise.reject(error);
      })
  }

}