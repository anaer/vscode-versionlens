import { TPackageSuggestion } from "domain/suggestions";
import { TPackageClientRequest } from "../definitions/tPackageClientRequest";
import { TPackageClientResponse } from "../definitions/tPackageClientResponse";
import { PackageResponse } from "../models/packageResponse";

export function createSuccess<TClientData>(
  providerName: string,
  request: TPackageClientRequest<TClientData>,
  response: TPackageClientResponse
): Array<PackageResponse> {
  // map the documents to responses
  return response.suggestions.map(
    function (suggestion: TPackageSuggestion, order: number): PackageResponse {
      return {
        providerName,
        nameRange: request.dependency.nameRange,
        versionRange: request.dependency.versionRange,
        requested: request.dependency.package,
        resolved: response.resolved,
        source: response.source,
        type: response.type,
        suggestion,
        order,
      };
    }
  );
}
