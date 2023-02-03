import { TPackageSuggestion, SuggestionFactory } from 'domain/suggestions'
import { PackageSourceTypes } from "../definitions/ePackageSourceTypes";
import { PackageVersionTypes } from "../definitions/ePackageVersionTypes";
import { TPackageDocument } from "../definitions/tPackageDocument";
import { TPackageIdentifier } from "../definitions/tPackageIdentifier";
import { TPackageResponseStatus } from "../definitions/tPackageResponseStatus";
import { TPackageRequest } from '../definitions/tPackageRequest';

export function create(
  source: PackageSourceTypes,
  request: TPackageRequest<any>,
  response: TPackageResponseStatus,
  suggestions: Array<TPackageSuggestion>
): TPackageDocument {

  const { package: requested } = request;

  return {
    source,
    type: null,
    requested,
    resolved: null,
    response,
    suggestions
  };

}

export function createInvalidVersion(
  requested: TPackageIdentifier,
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
    requested,
    response,
    resolved: null,
    suggestions
  };
}

export function createNoMatch(
  source: PackageSourceTypes,
  type: PackageVersionTypes,
  requested: TPackageIdentifier,
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
    requested,
    response,
    resolved: null,
    suggestions
  };
}

export function createFixed(
  source: PackageSourceTypes,
  requested: TPackageIdentifier,
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
    requested,
    response,
    resolved: null,
    suggestions
  };
}