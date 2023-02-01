import { PackageResponse, VersionHelpers } from 'domain/packages';
import { IProvider } from 'domain/providers/definitions/iProvider';
import minimatch from 'minimatch';
import { basename } from 'path';

export function defaultReplaceFn(packageResponse: PackageResponse, newVersion: string): string {
  return VersionHelpers.formatWithExistingLeading(
    packageResponse.requested.version,
    newVersion
  );
}

export function filtersProvidersByFileName<T extends IProvider>(
  fileName: string,
  providers: Array<T>
): Array<T> {

  const filename = basename(fileName);

  const filtered = providers.filter(
    provider => minimatch(filename, provider.config.fileMatcher.pattern)
  );

  if (filtered.length === 0) return [];

  return filtered;
}