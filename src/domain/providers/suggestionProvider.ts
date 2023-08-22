import { throwNull, throwUndefined } from "@esm-test/guards";
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

  constructor(client: TClient, logger: ILogger) {
    throwUndefined("client", client);
    throwNull("client", client);

    throwUndefined("logger", logger);
    throwNull("logger", logger);

    this.client = client;
    this.logger = logger;
  }

  client: TClient;

  logger: ILogger;

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

    // parallel the fetch requests
    return Promise.all(promises)
      // flatten results
      .then(x => x.flat());
  }

  fetchPackage(
    request: TPackageClientRequest<TClientData>
  ): Promise<Array<PackageResponse>> {
    const client = this.client;
    const requestedPackage = request.dependency.package;

    client.logger.debug("Fetching %s", requestedPackage.name);

    const startedAt = performance.now();

    return client.fetchPackage(request)
      .then(function (response: TPackageClientResponse) {
        const completedAt = performance.now();

        client.logger.info(
          'Fetched from %s %s@%s (%s ms)',
          response.responseStatus?.source,
          requestedPackage.name,
          requestedPackage.version,
          Math.floor(completedAt - startedAt)
        );

        if (response.responseStatus?.rejected) {
          client.logger.error(
            "%s@%s was rejected with the status code %s",
            requestedPackage.name,
            requestedPackage.version,
            response.responseStatus.status
          );
        }

        return ResponseFactory.createSuccess(
          client.config.providerName,
          request,
          response
        );
      })
      .catch((error: PackageResponse) => {

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