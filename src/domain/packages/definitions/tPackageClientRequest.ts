import { PackageDependency } from '../models/packageDependency';
import { TPackageResource } from './tPackageResource';

export type TPackageClientRequest<TClientData> = {
  // provider descriptor
  providerName: string;

  // provider specific data
  clientData: TClientData,

  // dependency ranges
  dependency: PackageDependency;

  // package to fetch
  package: TPackageResource;

  // number of fallback attempts
  attempt: number;
};