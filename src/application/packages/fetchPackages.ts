import {
  IPackageClient,
  PackageDependency,
  PackageResponse,
  TPackageClientRequest
} from "domain/packages";
import { fetchPackage } from "./fetchPackage";

export async function fetchPackages<TClientData>(
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
      await fetchPackage(
        client,
        clientRequest
      )
    );
  }

  return results;
}