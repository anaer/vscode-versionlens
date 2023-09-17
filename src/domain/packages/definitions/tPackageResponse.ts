import { TPackageSuggestion, TPackageTextRange } from 'domain/packages';
import { PackageSourceType } from '../clients/ePackageSource';
import { PackageVersionType } from '../definitions/ePackageVersionType';
import { TPackageNameVersion } from '../definitions/tPackageNameVersion';
import { TPackageResource } from '../definitions/tPackageResource';

export type PackageResponse = {
  providerName: string;
  type?: PackageVersionType;
  nameRange: TPackageTextRange;
  versionRange: TPackageTextRange;
  suggestion?: TPackageSuggestion;
  order: number;
  parsedPackage: TPackageResource;
  fetchedPackage?: TPackageNameVersion;
  packageSource?: PackageSourceType;
}