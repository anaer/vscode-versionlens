import { ILogger } from 'domain/logging';
import { IProviderConfig } from 'domain/providers';
import { TPackageClientResponse } from "./tPackageClientResponse";
import { TPackageRequest } from "./tPackageRequest";

export interface IPackageClient<TClientData> {

  logger: ILogger;

  config: IProviderConfig,

  fetchPackage: (request: TPackageRequest<TClientData>)
    => Promise<TPackageClientResponse>;

}