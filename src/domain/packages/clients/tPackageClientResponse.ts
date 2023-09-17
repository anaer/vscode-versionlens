import { PackageVersionType } from '../definitions/ePackageVersionType';
import { TPackageNameVersion } from '../definitions/tPackageNameVersion';
import { TPackageSuggestion } from '../suggestions/tPackageSuggestion';
import { PackageSourceType } from './ePackageSource';
import { TPackageClientResponseStatus } from './tPackageClientResponseStatus';

export type TPackageClientResponse = {

  source: PackageSourceType;

  responseStatus?: TPackageClientResponseStatus;

  type: PackageVersionType;

  resolved?: TPackageNameVersion;

  suggestions: Array<TPackageSuggestion>;

  gitSpec?: any;

};