import {
  IPackageClient,
  PackageResponse,
  ResponseFactory,
  TPackageRequest
} from 'domain/packages';

export async function fetchPackage<TClientData>(
  client: IPackageClient<TClientData>,
  request: TPackageRequest<TClientData>,
): Promise<Array<PackageResponse> | PackageResponse> {

  client.logger.debug(`Queued package: %s`, request.package.name);

  return client.fetchPackage(request)
    .then(function (response) {

      client.logger.info(
        'Fetched %s package from %s: %s@%s',
        response.providerName,
        response.response.source,
        request.package.name,
        request.package.version
      );

      return ResponseFactory.createSuccess(request, response);
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