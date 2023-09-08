import NpmCliConfig from '@npmcli/config';
import { ClientResponseSource, HttpClientResponse } from 'domain/clients';
import {
  PackageResponse,
  PackageSourceType,
  PackageVersionType,
  VersionUtils
} from 'domain/packages';
import { KeyStringDictionary, fileExists, readFile } from 'domain/utils';
import dotenv from 'dotenv';
import { resolve } from 'node:path';

export function npmReplaceVersion(packageInfo: PackageResponse, newVersion: string): string {
  if (packageInfo.packageSource === PackageSourceType.Github) {
    return replaceGitVersion(packageInfo, newVersion);
  }

  if (packageInfo.type === PackageVersionType.Alias) {
    return replaceAliasVersion(packageInfo, newVersion);
  }

  // fallback to default
  return VersionUtils.formatWithExistingLeading(
    packageInfo.parsedPackage.version,
    newVersion
  );
}

function replaceGitVersion(response: PackageResponse, newVersion: string): string {
  return response.parsedPackage.version.replace(
    response.fetchedPackage.version,
    newVersion
  )
}

function replaceAliasVersion(packageInfo: PackageResponse, newVersion: string): string {
  // preserve the leading symbol from the existing version
  const preservedLeadingVersion = VersionUtils.formatWithExistingLeading(
    packageInfo.parsedPackage.version,
    newVersion
  );

  return `npm:${packageInfo.fetchedPackage.name}@${preservedLeadingVersion}`;
}

export function convertNpmErrorToResponse(
  error,
  source: ClientResponseSource
): HttpClientResponse {
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

export async function createPacoteOptions(packagePath: string, options: any): Promise<any> {
  const {
    npmRcFilePath,
    envFilePath,
    userConfigPath,
    hasNpmRcFile,
    hasEnvFile
  } = options;

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
    env: hasEnvFile
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