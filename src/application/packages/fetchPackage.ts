import {
  IPackageClient,
  PackageResponse,
  ResponseFactory,
  TPackageDocument,
  TPackageRequest
} from 'domain/packages';

export function fetchPackage<TClientData>(
  client: IPackageClient<TClientData>,
  request: TPackageRequest<TClientData>,
): Promise<Array<PackageResponse>> {

  client.logger.debug("Queued package: %s", request.package.name);

  return client.fetchPackage(request)
    .then(function (document: TPackageDocument) {

      client.logger.info(
        'Fetched %s package from %s: %s@%s',
        document.providerName,
        document.response.source,
        request.package.name,
        request.package.version
      );

      return ResponseFactory.createSuccess(request, document);
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