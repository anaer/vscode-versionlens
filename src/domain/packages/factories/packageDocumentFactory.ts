import { ClientResponseSource } from 'domain/clients/index';
import { TPackageSuggestion, SuggestionFactory } from 'domain/suggestions'
import { PackageSourceTypes } from "../definitions/ePackageSourceTypes";
import { PackageVersionTypes } from "../definitions/ePackageVersionTypes";
import { TPackageDocument } from "../definitions/tPackageDocument";
import { TPackageResponseStatus } from "../definitions/tPackageResponseStatus";

export function create(
  source: PackageSourceTypes,
  response: TPackageResponseStatus,
  suggestions: Array<TPackageSuggestion>
): TPackageDocument {

  return {
    source,
    type: null,
    resolved: null,
    response,
    suggestions
  };

}

export function createInvalidVersion(
  response: TPackageResponseStatus,
  type: PackageVersionTypes
): TPackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.Registry;
  const suggestions: Array<TPackageSuggestion> = [
    SuggestionFactory.createInvalid(''),
    SuggestionFactory.createLatest(),
  ];

  return {
    source,
    type,
    response,
    resolved: null,
    suggestions
  };
}

export function createNoMatch(
  source: PackageSourceTypes,
  type: PackageVersionTypes,
  response: TPackageResponseStatus,
  latestVersion?: string
): TPackageDocument {

  const suggestions: Array<TPackageSuggestion> = [
    SuggestionFactory.createNoMatch(),
    SuggestionFactory.createLatest(latestVersion),
  ];

  return {
    source,
    type,
    response,
    resolved: null,
    suggestions
  };
}

export function createFixed(
  source: PackageSourceTypes,
  response: TPackageResponseStatus,
  type: PackageVersionTypes,
  fixedVersion: string
): TPackageDocument {

  const suggestions: Array<TPackageSuggestion> = [
    SuggestionFactory.createFixedStatus(fixedVersion)
  ];

  return {
    source,
    type,
    response,
    resolved: null,
    suggestions
  };
}

export function createResponseStatus(source: ClientResponseSource, status: number): TPackageResponseStatus {
  return {
    source,
    status
  };
}