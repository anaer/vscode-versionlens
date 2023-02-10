import { TPackageSuggestion } from 'domain/suggestions';
import { PackageVersionType } from '../definitions/ePackageVersionType';
import { TPackageNameVersion } from '../definitions/tPackageNameVersion';
import { PackageClientSourceType } from './ePackageClientSourceType';
import { TPackageResponseStatus } from './tPackageResponseStatus';

export type TPackageClientResponse = {

  source: PackageClientSourceType;

  responseStatus?: TPackageResponseStatus;

  type: PackageVersionType;

  resolved?: TPackageNameVersion;

  suggestions: Array<TPackageSuggestion>;

  gitSpec?: any;

};