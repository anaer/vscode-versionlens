import { TPackageSuggestion } from 'domain/suggestions';
import { PackageVersionType } from '../definitions/ePackageVersionType';
import { TPackageNameVersion } from '../definitions/tPackageNameVersion';
import { PackageClientSourceType } from './ePackageClientSourceType';
import { TPackageClientResponseStatus } from './tPackageClientResponseStatus';

export type TPackageClientResponse = {

  source: PackageClientSourceType;

  responseStatus?: TPackageClientResponseStatus;

  type: PackageVersionType;

  resolved?: TPackageNameVersion;

  suggestions: Array<TPackageSuggestion>;

  gitSpec?: any;

};