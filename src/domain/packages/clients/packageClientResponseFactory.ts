import { ClientResponseSource } from 'domain/clients';
import { SuggestionFactory, TPackageSuggestion } from 'domain/suggestions';
import { PackageVersionType } from "../definitions/ePackageVersionType";
import { PackageClientSourceType } from "./ePackageClientSourceType";
import { TPackageClientResponse } from "./tPackageClientResponse";
import { TPackageResponseStatus } from "./tPackageResponseStatus";

export function create(
  source: PackageClientSourceType,
  responseStatus: TPackageResponseStatus,
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
  responseStatus: TPackageResponseStatus,
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
  responseStatus: TPackageResponseStatus,
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
  responseStatus: TPackageResponseStatus,
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

export function createResponseStatus(source: ClientResponseSource, status: number): TPackageResponseStatus {
  return {
    source,
    status
  };
}