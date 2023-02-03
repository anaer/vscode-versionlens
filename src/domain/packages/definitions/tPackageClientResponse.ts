import { TPackageSuggestion } from 'domain/suggestions';
import { PackageSourceType } from './ePackageSourceType';
import { PackageVersionType } from './ePackageVersionType';
import { TClientResponseStatus } from './tPackageResponseStatus';
import { TPackageNameVersion } from './tPackageNameVersion';

export type TPackageClientResponse = {

  source: PackageSourceType;

  responseStatus?: TClientResponseStatus;

  type: PackageVersionType;

  resolved?: TPackageNameVersion;

  suggestions: Array<TPackageSuggestion>;

  gitSpec?: any;

};