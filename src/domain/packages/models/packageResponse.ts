import { TPackageSuggestion } from 'domain/suggestions';
import { PackageClientSourceType } from '../clients/ePackageClientSourceType';
import { TPackageClientResponseStatus } from '../clients/tPackageClientResponseStatus';
import { PackageResponseError } from '../definitions/ePackageResponseError';
import { PackageVersionType } from '../definitions/ePackageVersionType';
import { TPackageDependencyRange } from '../definitions/tPackageDependencyRange';
import { TPackageNameVersion } from '../definitions/tPackageNameVersion';
import { TPackageResource } from '../definitions/tPackageResource';

export type PackageResponse = {
  providerName: string;
  requested: TPackageResource;

  nameRange: TPackageDependencyRange;
  versionRange: TPackageDependencyRange;
  order: number;

  error?: PackageResponseError;
  errorMessage?: string;
  source?: PackageClientSourceType;
  response?: TPackageClientResponseStatus;
  type?: PackageVersionType;
  resolved?: TPackageNameVersion;
  suggestion?: TPackageSuggestion;
}