import { TClientResponse } from 'domain/clients';

export interface NugetServiceResource {
  '@id': string;
  '@type': string;
}

export interface NugetServiceIndex {
  version: string;
  resources: Array<NugetServiceResource>;
}

export type NugetServiceIndexResponse = TClientResponse<number, NugetServiceIndex>

export type NuGetClientData = {
  serviceUrls: Array<string>,
}

export type NugetVersionSpec = {
  version?: string;
  hasFourSegments?: boolean;
  isMinInclusive?: boolean;
  isMaxInclusive?: boolean;
  minVersionSpec?: NugetVersionSpec;
  maxVersionSpec?: NugetVersionSpec;
};
