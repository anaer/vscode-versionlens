import { PackageSourceType, PackageVersionType, TPackageTextRange } from "domain/packages";
import { SuggestionTypes } from "domain/suggestions";

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