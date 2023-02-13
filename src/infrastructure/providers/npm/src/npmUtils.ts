import NpmCliConfig from '@npmcli/config';
import { ClientResponse, ClientResponseSource } from 'domain/clients';
import { KeyStringDictionary } from 'domain/generics';
import {
  PackageClientSourceType,
  PackageResponse,
  PackageVersionType,
  VersionUtils
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
  return VersionUtils.formatWithExistingLeading(
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
  const preservedLeadingVersion = VersionUtils.formatWithExistingLeading(
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

export async function getDotEnv(envPath: string): Promise<KeyStringDictionary> {
  // return the parsed env object
  return dotenv.parse(await readFile(envPath));
}

export async function createPacoteOptions(
  packagePath: string,
  npmCliOptions: any
): Promise<any> {
  const { npmRcFilePath, envFilePath, userConfigPath } = npmCliOptions;

  const hasNpmRcFile = npmRcFilePath.length > 0;

  // load the npm config
  const npmCliConfig = new NpmCliConfig({
    shorthands: {},
    definitions: {},
    npmPath: packagePath,
    // use the npmrc path to make npm cli parse the npmrc file
    // otherwise defaults to the package path
    cwd: hasNpmRcFile ? npmRcFilePath : packagePath,
    // ensures user npmrc is parsed by npm
    argv: ['', '', `--userconfig=${userConfigPath}`],
    // pass through .env data
    env: hasNpmRcFile
      ? await getDotEnv(envFilePath)
      : {}
  });

  await npmCliConfig.load();

  // flatten all the options
  return npmCliConfig.list.reduce(
    (memo, list) => ({ ...memo, ...list }),
    { cwd: packagePath }
  );
}