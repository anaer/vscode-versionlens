import { ClientResponseSource } from 'domain/clients';
import {
  SuggestionFactory,
  SuggestionFlags,
  TPackageSuggestion
} from 'domain/suggestions';
import { ClientResponseFactory } from '..';
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

export function createDirectory(
  packageName: string,
  path: string
): TPackageClientResponse {

  const source = PackageClientSourceType.Directory;
  const type = PackageVersionType.Version;

  const resolved = {
    name: packageName,
    version: path,
  };

  const suggestions: Array<TPackageSuggestion> = [
    {
      name: 'file://',
      version: resolved.version,
      flags: SuggestionFlags.release
    },
  ];

  const responseStatus = ClientResponseFactory.createResponseStatus(
    ClientResponseSource.local,
    200
  );

  return {
    source,
    type,
    responseStatus,
    resolved,
    suggestions
  };
}

export function createGit(): TPackageClientResponse {
  return createFixed(
    PackageClientSourceType.Git,
    ClientResponseFactory.createResponseStatus(ClientResponseSource.local, 0),
    PackageVersionType.Committish,
    'git repository'
  );
}

export function createResponseStatus(
  source: ClientResponseSource,
  status: number
): TPackageClientResponseStatus {
  return {
    source,
    status
  };
}