import { ClientResponse, ClientResponseSource } from 'domain/clients';
import { KeyStringDictionary } from 'domain/generics';
import {
  PackageClientSourceType,
  PackageResponse,
  PackageVersionType,
  VersionHelpers
} from 'domain/packages';
import { fileExists, readFile } from 'domain/utils';
import dotenv from 'dotenv';
import { resolve } from 'node:path';

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

export function convertNpmErrorToResponse(
  error,
  source: ClientResponseSource
): ClientResponse<number, string> {
  return {
    source,
    status: error.code,
    data: error.message,
  }
}

export async function resolveDotFilePath(
  dotFileName: string,
  cwds: Array<string>
): Promise<string> {
  for (const cwd of cwds) {
    const checkPath = resolve(cwd, dotFileName);
    const dotFileExists = await fileExists(checkPath);
    if (dotFileExists) return checkPath;
  }

  return "";
}

export async function getDotEnv(cwds: Array<string>): Promise<KeyStringDictionary> {
  // try to resolve the .env file
  const envPath = await resolveDotFilePath(".env", cwds);
  if (envPath.length === 0) return {};

  // return the parsed env object
  return dotenv.parse(await readFile(envPath));
}