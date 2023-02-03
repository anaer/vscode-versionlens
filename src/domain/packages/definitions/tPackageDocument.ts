import { TPackageSuggestion } from 'domain/suggestions';
import { PackageSourceTypes } from './ePackageSourceTypes';
import { PackageVersionTypes } from './ePackageVersionTypes';
import { TClientResponseStatus } from './tPackageResponseStatus';
import { TPackageNameVersion } from './tPackageNameVersion';

export type TPackageDocument = {

  source: PackageSourceTypes;

  responseStatus?: TClientResponseStatus;

  type: PackageVersionTypes;

  resolved?: TPackageNameVersion;

  suggestions: Array<TPackageSuggestion>;

  gitSpec?: any;

};