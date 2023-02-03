import { TPackageSuggestion } from 'domain/suggestions';
import { PackageSourceTypes } from './ePackageSourceTypes';
import { PackageVersionTypes } from './ePackageVersionTypes';
import { TPackageResponseStatus } from './tPackageResponseStatus';
import { TPackageNameVersion } from './tPackageNameVersion';

export type TPackageDocument = {

  source: PackageSourceTypes;

  response?: TPackageResponseStatus;

  type: PackageVersionTypes;

  resolved: TPackageNameVersion;

  suggestions: Array<TPackageSuggestion>;

  gitSpec?: any;

};