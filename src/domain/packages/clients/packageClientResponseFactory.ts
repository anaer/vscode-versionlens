import { ClientResponseSource } from 'domain/clients';
import { SuggestionFactory, TPackageSuggestion } from 'domain/suggestions';
import { PackageVersionType } from "../definitions/ePackageVersionType";
import { PackageClientSourceType } from "./ePackageClientSourceType";
import { TPackageClientResponse } from "./tPackageClientResponse";
import { TPackageClientResponseStatus } from "./tPackageClientResponseStatus";

export function create(
  source: PackageClientSourceType,
  responseStatus: TPackageClientResponseStatus,
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
  responseStatus: TPackageClientResponseStatus,
  type: PackageVersionType
): TPackageClientResponse {
  const source: PackageClientSourceType = PackageClientSourceType.Registry;
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
  source: PackageClientSourceType,
  type: PackageVersionType,
  responseStatus: TPackageClientResponseStatus,
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
  source: PackageClientSourceType,
  responseStatus: TPackageClientResponseStatus,
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

export function createResponseStatus(source: ClientResponseSource, status: number): TPackageClientResponseStatus {
  return {
    source,
    status
  };
}