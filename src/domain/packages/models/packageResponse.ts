import { TPackageSuggestion } from 'domain/suggestions';
import { PackageSourceType } from '../clients/ePackageSource';
import { TPackageClientResponseStatus } from '../clients/tPackageClientResponseStatus';
import { PackageResponseError } from '../definitions/ePackageResponseError';
import { PackageVersionType } from '../definitions/ePackageVersionType';
import { TPackageNameVersion } from '../definitions/tPackageNameVersion';
import { TPackageResource } from '../definitions/tPackageResource';
import { TPackageTextRange } from '../definitions/tPackageTextRange';

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
  clientResponse?: TPackageClientResponseStatus;
  error?: PackageResponseError;
  errorMessage?: string;
}