import { ClientResponseSource } from 'domain/clients';
import { TPackageSuggestion } from "domain/suggestions";
import { TPackageResponseStatus } from "../definitions/tPackageResponseStatus";
import { TPackageRequest } from "../definitions/tPackageRequest";
import { TPackageDocument } from "../definitions/tPackageDocument";
import { PackageResponse } from "../models/packageResponse";

export function createResponseStatus(source: ClientResponseSource, status: number): TPackageResponseStatus {
  return {
    source,
    status
  };
}

export function createSuccess<TClientData>(
  providerName: string,
  request: TPackageRequest<TClientData>,
  response: TPackageDocument
): Array<PackageResponse> {
  // map the documents to responses
  return response.suggestions.map(
    function (suggestion: TPackageSuggestion, order: number): PackageResponse {
      return {
        providerName,
        nameRange: request.dependency.nameRange,
        versionRange: request.dependency.versionRange,
        source: response.source,
        type: response.type,
        requested: response.requested,
        resolved: response.resolved,
        suggestion,
        order,
      };
    }
  );
}
