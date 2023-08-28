import { PackageResponse } from 'domain/packages';
import { defaultReplaceFn } from 'domain/suggestions';

export function pubReplaceVersion(packageInfo: PackageResponse, newVersion: string): string {

  const charAt = this.substr(packageInfo.versionRange.start, 1);

  return defaultReplaceFn(
    packageInfo,
    // handle cases with blank entries and # comments
    charAt === '#' ?
      newVersion + ' ' :
      newVersion
  );

}