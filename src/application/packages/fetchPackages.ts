import {
  IPackageClient,
  PackageDependency,
  PackageResponse,
  TPackageClientRequest
} from "domain/packages";
import { fetchPackage } from "./fetchPackage";

export async function fetchPackages<TClientData>(
  packagePath: string,
  client: IPackageClient<TClientData>,
  clientData: TClientData,
  dependencies: Array<PackageDependency>,
): Promise<Array<PackageResponse>> {

  const { providerName } = client.config;

  const results: PackageResponse[] = [];

  for (const dependency of dependencies) {
    // build the client request
    const { name, version } = dependency.packageInfo;
    const clientRequest: TPackageClientRequest<TClientData> = {
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
    results.push.apply(
      results,
      await fetchPackage(
        client,
        clientRequest
      )
    );
  }

  return results;
}