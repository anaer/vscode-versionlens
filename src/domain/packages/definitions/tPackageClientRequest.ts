import { PackageDependency } from '../models/packageDependency';
import { TPackageIdentifier } from './tPackageIdentifier';

export type TPackageClientRequest<TClientData> = {
  // provider descriptor
  providerName: string;

  // provider specific data
  clientData: TClientData,

  // dependency ranges
  dependency: PackageDependency;

  // package to fetch
  package: TPackageIdentifier;

  // number of fallback attempts
  attempt: number;
};