import {
  ClientResponseFactory,
  PackageClientSourceType,
  PackageVersionType,
  TPackageClientResponse,
  TPackageClientResponseStatus,
  TPackageResource
} from 'domain/packages';
import { SuggestionFlags, TPackageSuggestion } from 'domain/suggestions';
import { NpaSpec } from '../models/npaSpec';

export const fileDependencyRegex = /^file:(.*)$/;

export function createDirectory(
  requested: TPackageResource,
  responseStatus: TPackageClientResponseStatus,
  npaSpec: NpaSpec
): TPackageClientResponse {

  const fileRegExpResult = fileDependencyRegex.exec(requested.version);
  if (!fileRegExpResult) {
    return ClientResponseFactory.createInvalidVersion(
      responseStatus,
      <any>npaSpec.type // todo create a converter
    );
  }

  const source = PackageClientSourceType.Directory;
  const type = PackageVersionType.Version;

  const resolved = {
    name: npaSpec.name,
    version: fileRegExpResult[1],
  };

  const suggestions: Array<TPackageSuggestion> = [
    {
      name: 'file://',
      version: resolved.version,
      flags: SuggestionFlags.release
    },
  ]

  return {
    source,
    type,
    responseStatus,
    resolved,
    suggestions
  };
}