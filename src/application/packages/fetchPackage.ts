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

  client.logger.debug("Queued package: %s", request.package.name);
  const startedAt = performance.now();
  return client.fetchPackage(request)
    .then(function (document: TPackageClientResponse) {

      const completedAt = performance.now();

      client.logger.info(
        'Fetched %s package from %s: %s@%s (%s ms)',
        client.config.providerName,
        document.responseStatus.source,
        request.package.name,
        request.package.version,
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
        request.package,
        error
      );

      return Promise.reject(error);
    })
}