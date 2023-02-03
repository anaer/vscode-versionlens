import { ClientResponseSource } from 'domain/clients/index';
import { TPackageSuggestion, SuggestionFactory } from 'domain/suggestions'
import { PackageSourceType } from "../definitions/ePackageSourceType";
import { PackageVersionType } from "../definitions/ePackageVersionType";
import { TPackageClientResponse } from "../definitions/tPackageClientResponse";
import { TClientResponseStatus } from "../definitions/tPackageResponseStatus";

export function create(
  source: PackageSourceType,
  responseStatus: TClientResponseStatus,
  suggestions: Array<TPackageSuggestion>
): TPackageClientResponse {

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
  type: PackageVersionType
): TPackageClientResponse {
  const source: PackageSourceType = PackageSourceType.Registry;
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
  source: PackageSourceType,
  type: PackageVersionType,
  responseStatus: TClientResponseStatus,
  latestVersion?: string
): TPackageClientResponse {

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
  source: PackageSourceType,
  responseStatus: TClientResponseStatus,
  type: PackageVersionType,
  fixedVersion: string
): TPackageClientResponse {

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