import { TPackageSuggestion } from 'domain/suggestions';
import { PackageClientSourceType } from '../clients/ePackageClientSourceType';
import { PackageResponseError } from '../definitions/ePackageResponseError';
import { PackageVersionType } from '../definitions/ePackageVersionType';
import { TPackageDependencyRange } from '../definitions/tPackageDependencyRange';
import { TPackageNameVersion } from '../definitions/tPackageNameVersion';
import { TPackageResource } from '../definitions/tPackageResource';
import { TPackageResponseStatus } from '../definitions/tPackageResponseStatus';

export class PackageResponse {
  providerName: string;
  requested: TPackageResource;

  nameRange: TPackageDependencyRange;
  versionRange: TPackageDependencyRange;
  order: number;

  error?: PackageResponseError;
  errorMessage?: string;
  source?: PackageClientSourceType;
  response?: TPackageResponseStatus;
  type?: PackageVersionType;
  resolved?: TPackageNameVersion;
  suggestion?: TPackageSuggestion;
}