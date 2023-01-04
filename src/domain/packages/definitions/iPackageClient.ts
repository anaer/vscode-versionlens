import { ILogger } from 'domain/logging';
import { IProviderConfig } from 'domain/providers';

import { TPackageRequest } from "./tPackageRequest";
import { TPackageDocument } from "./tPackageDocument";

export interface IPackageClient<TClientData> {

  logger: ILogger;

  config: IProviderConfig,

  fetchPackage: (request: TPackageRequest<TClientData>)
    => Promise<TPackageDocument>;

}