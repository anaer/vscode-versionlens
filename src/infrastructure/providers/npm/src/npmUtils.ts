import { ClientResponse, ClientResponseSource } from 'domain/clients';
import { KeyStringDictionary } from 'domain/generics';
import {
  PackageClientSourceType,
  PackageResponse,
  PackageVersionType,
  VersionHelpers
} from 'domain/packages';
import dotenv from 'dotenv';
import findConfig from 'find-config';
import fs from 'node:fs';

export function npmReplaceVersion(packageInfo: PackageResponse, newVersion: string): string {
  if (packageInfo.source === PackageClientSourceType.Github) {
    return replaceGitVersion(packageInfo, newVersion);
  }

  if (packageInfo.type === PackageVersionType.Alias) {
    return replaceAliasVersion(packageInfo, newVersion);
  }

  // fallback to default
  return VersionHelpers.formatWithExistingLeading(
    packageInfo.requested.version,
    newVersion
  );
}

function replaceGitVersion(packageInfo: PackageResponse, newVersion: string): string {
  return packageInfo.requested.version.replace(
    packageInfo.resolved.version,
    newVersion
  )
}

function replaceAliasVersion(packageInfo: PackageResponse, newVersion: string): string {
  // preserve the leading symbol from the existing version
  const preservedLeadingVersion = VersionHelpers.formatWithExistingLeading(
    packageInfo.requested.version,
    newVersion
  );

  return `npm:${packageInfo.resolved.name}@${preservedLeadingVersion}`;
}

export function convertNpmErrorToResponse(error, source: ClientResponseSource): ClientResponse<number, string> {
  return {
    source,
    status: error.code,
    data: error.message,
  }
}

export function getDotEnv(cwd: string): KeyStringDictionary {
  // check for npmrc files
  const npmrcPath = findConfig('.npmrc', { cwd, dot: true });
  if (!npmrcPath) return {};

  // find the env file
  const envPath = findConfig('.env', { cwd, dot: true });
  if (!envPath) return {};

  // return the parsed env object
  return dotenv.parse(fs.readFileSync(envPath, 'utf8'));
}