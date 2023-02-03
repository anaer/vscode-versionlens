import { TPackageSuggestion } from 'domain/suggestions';

import { PackageSourceType } from '../definitions/ePackageSourceType';
import { PackageVersionType } from '../definitions/ePackageVersionType';
import { PackageResponseError } from '../definitions/ePackageResponseError';
import { TPackageNameVersion } from '../definitions/tPackageNameVersion';
import { TPackageIdentifier } from '../definitions/tPackageIdentifier';
import { TClientResponseStatus } from '../definitions/tPackageResponseStatus';
import { TPackageDependencyRange } from '../definitions/tPackageDependencyRange';

export class PackageResponse {
  providerName: string;
  requested: TPackageIdentifier;

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