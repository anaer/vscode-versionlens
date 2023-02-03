import {
  IPackageClient,
  PackageResponse,
  ResponseFactory,
  TPackageClientRequest,
  TPackageClientResponse
} from 'domain/packages';

export function fetchPackage<TClientData>(
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
        fetchPackage.name,
        requestedPackage,
        error
      );

      return Promise.reject(error);
    })
}