import { PackageResponse, TSuggestionUpdate } from 'domain/packages';

export function mapToSuggestionUpdate(packageResponse: PackageResponse): TSuggestionUpdate {
  return {
    packageSource: packageResponse.packageSource,
    packageVersionType: packageResponse.type,

    parsedName: packageResponse.parsedPackage.name,
    parsedVersion: packageResponse.parsedPackage.version,
    parsedVersionRange: packageResponse.versionRange,

    fetchedName: packageResponse.fetchedPackage?.name,
    fetchedVersion: packageResponse.fetchedPackage?.version,

    suggestionType: packageResponse.suggestion.type,
    suggestionVersion: packageResponse.suggestion.version,
  }
}