import { IServiceCollection } from "./iServiceCollection";

export interface IServiceCollectionFactory {

  createServiceCollection: () => IServiceCollection

}