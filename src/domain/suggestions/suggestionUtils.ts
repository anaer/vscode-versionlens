import { PackageResponse, VersionUtils } from 'domain/packages';

export function defaultReplaceFn(packageResponse: PackageResponse, newVersion: string): string {
  return VersionUtils.formatWithExistingLeading(
    packageResponse.requested.version,
    newVersion
  );
}