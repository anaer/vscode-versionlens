import { TPackageSuggestion } from 'domain/suggestions';
import { PackageResponseError } from '../definitions/ePackageResponseError';
import { PackageSourceType } from '../definitions/ePackageSourceType';
import { PackageVersionType } from '../definitions/ePackageVersionType';
import { TPackageDependencyRange } from '../definitions/tPackageDependencyRange';
import { TPackageNameVersion } from '../definitions/tPackageNameVersion';
import { TPackageResource } from '../definitions/tPackageResource';
import { TClientResponseStatus } from '../definitions/tPackageResponseStatus';

export class PackageResponse {
  providerName: string;
  requested: TPackageResource;

  nameRange: TPackageDependencyRange;
  versionRange: TPackageDependencyRange;
  order: number;

  error?: PackageResponseError;
  errorMessage?: string;
  source?: PackageSourceType;
  response?: TClientResponseStatus;
  type?: PackageVersionType;
  resolved?: TPackageNameVersion;
  suggestion?: TPackageSuggestion;
}