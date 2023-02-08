import { TPackageSuggestion } from 'domain/suggestions';
import { PackageVersionType } from '../definitions/ePackageVersionType';
import { TPackageNameVersion } from '../definitions/tPackageNameVersion';
import { TPackageResponseStatus } from '../definitions/tPackageResponseStatus';
import { PackageClientSourceType } from './ePackageClientSourceType';

export type TPackageClientResponse = {

  source: PackageClientSourceType;

  responseStatus?: TPackageResponseStatus;

  type: PackageVersionType;

  resolved?: TPackageNameVersion;

  suggestions: Array<TPackageSuggestion>;

  gitSpec?: any;

};