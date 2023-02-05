import { IServiceProvider } from "./iServiceProvider";

export interface IServiceProviderFactory {

  createServiceProvider: () => IServiceProvider

}