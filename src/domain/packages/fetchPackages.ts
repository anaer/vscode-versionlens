import {
  IPackageClient,
  IPackageDependency,
  PackageResponse,
  TPackageRequest
} from "domain/packages";
import { fetchPackage } from "./fetchPackage";

export async function fetchPackages<TClientData>(
  packagePath: string,
  client: IPackageClient<TClientData>,
  clientData: TClientData,
  dependencies: Array<IPackageDependency>,
): Promise<Array<PackageResponse>> {

  const { providerName } = client.config;

  const results = [];
  const promises = dependencies.map(
    function (dependency) {

      // build the client request
      const { name, version } = dependency.packageInfo;
      const clientRequest: TPackageRequest<TClientData> = {
        providerName,
        clientData,
        dependency,
        package: {
          name,
          version,
          path: packagePath,
        },
        attempt: 0
      };

      // execute request
      const promisedDependency = fetchPackage(
        client,
        clientRequest
      );

      // flatten responses
      return promisedDependency.then(
        function (responses) {
          if (Array.isArray(responses))
            results.push(...responses)
          else
            results.push(responses);
        }
      );

    }

  );

  return Promise.all(promises).then(_ => results)
}