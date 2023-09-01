import { PackageResponse, VersionUtils } from 'domain/packages';

export function defaultReplaceFn(response: PackageResponse, newVersion: string): string {
  return VersionUtils.formatWithExistingLeading(
    response.parsedPackage.version,
    newVersion
  );
}