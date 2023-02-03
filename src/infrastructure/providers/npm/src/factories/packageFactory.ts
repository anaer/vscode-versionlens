import {
  DocumentFactory,
  TPackageIdentifier,
  TClientResponseStatus,
  TPackageDocument,
  PackageVersionTypes,
  PackageSourceTypes
} from 'domain/packages';
import { TPackageSuggestion, SuggestionFlags } from 'domain/suggestions';

import { NpaSpec } from '../models/npaSpec';

export const fileDependencyRegex = /^file:(.*)$/;

export function createDirectory(
  requested: TPackageIdentifier,
  responseStatus: TClientResponseStatus,
  npaSpec: NpaSpec
): TPackageDocument {

  const fileRegExpResult = fileDependencyRegex.exec(requested.version);
  if (!fileRegExpResult) {
    return DocumentFactory.createInvalidVersion(
      responseStatus,
      <any>npaSpec.type // todo create a converter
    );
  }

  const source = PackageSourceTypes.Directory;
  const type = PackageVersionTypes.Version;

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