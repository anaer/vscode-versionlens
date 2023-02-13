import { ClientResponse, ClientResponseSource } from 'domain/clients';
import { KeyStringDictionary } from 'domain/generics';
import {
  PackageClientSourceType,
  PackageResponse,
  PackageVersionType,
  TPackageResource,
  VersionUtils
} from 'domain/packages';
import { fileExists, readFile } from 'domain/utils';
import dotenv from 'dotenv';
import { homedir } from 'node:os';
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

export async function getDotEnv(cwds: Array<string>): Promise<KeyStringDictionary> {
  // try to resolve the .env file
  const envPath = await resolveDotFilePath(".env", cwds);
  if (envPath.length === 0) return {};

  // return the parsed env object
  return dotenv.parse(await readFile(envPath));
}

export async function createPacoteOptions(
  projectPath: string,
  requestedPackage: TPackageResource,
  NpmCliConfig: any
): Promise<any> {
  // package path takes precedence
  const resolveDotFilePaths = [
    requestedPackage.path,
    projectPath
  ];

  // try to resolve the .npmrc file path
  const npmRcFilePath = await resolveDotFilePath(
    ".npmrc",
    resolveDotFilePaths
  );

  const hasNpmRcFile = npmRcFilePath.length > 0;

  // load the npm config
  const userConfigPath = resolve(homedir(), ".npmrc");
  const npmConfig = new NpmCliConfig({
    shorthands: {},
    definitions: {},
    npmPath: requestedPackage.path,
    // use the npmrc path to make npm cli parse the npmrc file
    // otherwise defaults to the package path
    cwd: hasNpmRcFile ? npmRcFilePath : requestedPackage.path,
    // ensures user config is parsed by npm
    argv: ['', '', `--userconfig=${userConfigPath}`],
    // pass through .env data only if there is an .npmrc file
    env: hasNpmRcFile
      ? await getDotEnv(resolveDotFilePaths)
      : {}
  });

  await npmConfig.load();

  // flatten all the options
  return npmConfig.list.reduce(
    (memo, list) => ({ ...memo, ...list }),
    { cwd: requestedPackage.path }
  );
}