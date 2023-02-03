import {
  DocumentFactory,
  TPackageIdentifier,
  TClientResponseStatus,
  TPackageClientResponse,
  PackageVersionType,
  PackageSourceType
} from 'domain/packages';
import { TPackageSuggestion, SuggestionFlags } from 'domain/suggestions';

import { NpaSpec } from '../models/npaSpec';

export const fileDependencyRegex = /^file:(.*)$/;

export function createDirectory(
  requested: TPackageIdentifier,
  responseStatus: TClientResponseStatus,
  npaSpec: NpaSpec
): TPackageClientResponse {

  const fileRegExpResult = fileDependencyRegex.exec(requested.version);
  if (!fileRegExpResult) {
    return DocumentFactory.createInvalidVersion(
      responseStatus,
      <any>npaSpec.type // todo create a converter
    );
  }

  const source = PackageSourceType.Directory;
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