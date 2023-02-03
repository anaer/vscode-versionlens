import { ClientResponseSource } from 'domain/clients/index';
import { TPackageSuggestion, SuggestionFactory } from 'domain/suggestions'
import { PackageSourceTypes } from "../definitions/ePackageSourceTypes";
import { PackageVersionTypes } from "../definitions/ePackageVersionTypes";
import { TPackageDocument } from "../definitions/tPackageDocument";
import { TClientResponseStatus } from "../definitions/tPackageResponseStatus";

export function create(
  source: PackageSourceTypes,
  responseStatus: TClientResponseStatus,
  suggestions: Array<TPackageSuggestion>
): TPackageDocument {

  return {
    source,
    type: null,
    resolved: null,
    responseStatus,
    suggestions
  };

}

export function createInvalidVersion(
  responseStatus: TClientResponseStatus,
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
    responseStatus,
    resolved: null,
    suggestions
  };
}

export function createNoMatch(
  source: PackageSourceTypes,
  type: PackageVersionTypes,
  responseStatus: TClientResponseStatus,
  latestVersion?: string
): TPackageDocument {

  const suggestions: Array<TPackageSuggestion> = [
    SuggestionFactory.createNoMatch(),
    SuggestionFactory.createLatest(latestVersion),
  ];

  return {
    source,
    type,
    responseStatus,
    resolved: null,
    suggestions
  };
}

export function createFixed(
  source: PackageSourceTypes,
  responseStatus: TClientResponseStatus,
  type: PackageVersionTypes,
  fixedVersion: string
): TPackageDocument {

  const suggestions: Array<TPackageSuggestion> = [
    SuggestionFactory.createFixedStatus(fixedVersion)
  ];

  return {
    source,
    type,
    responseStatus,
    resolved: null,
    suggestions
  };
}

export function createResponseStatus(source: ClientResponseSource, status: number): TClientResponseStatus {
  return {
    source,
    status
  };
}