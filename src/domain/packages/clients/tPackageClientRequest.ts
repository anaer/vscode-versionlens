import { PackageDependency } from '../models/packageDependency';

export type TPackageClientRequest<TClientData> = {
  // provider descriptor
  providerName: string;

  // provider specific data
  clientData: TClientData,

  // dependency to fetch
  dependency: PackageDependency;

  // number of fallback attempts
  attempt: number;
};