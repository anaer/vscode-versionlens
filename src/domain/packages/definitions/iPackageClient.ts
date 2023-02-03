import { ILogger } from 'domain/logging';
import { IProviderConfig } from 'domain/providers';
import { TPackageClientRequest } from "./tPackageClientRequest";
import { TPackageClientResponse } from "./tPackageClientResponse";

export interface IPackageClient<TClientData> {

  logger: ILogger;

  config: IProviderConfig,

  fetchPackage: (request: TPackageClientRequest<TClientData>)
    => Promise<TPackageClientResponse>;

}