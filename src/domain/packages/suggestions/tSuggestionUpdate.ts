import {
  PackageSourceType,
  PackageVersionType,
  SuggestionTypes,
  TPackageTextRange
} from "domain/packages";

export type TSuggestionUpdate = {
  packageSource: PackageSourceType,
  packageVersionType: PackageVersionType,

  parsedName: string,
  parsedVersion: string,
  parsedVersionRange: TPackageTextRange,

  fetchedName?: string,
  fetchedVersion?: string,

  suggestionType: SuggestionTypes,
  suggestionVersion: string,
}