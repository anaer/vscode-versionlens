import { IServiceCollection } from "domain/di";
import { addPackageFileWatcher, addStorage, addWinstonChannelLogger, addWinstonLogger } from ".";

export function addInfrastructureServices(services: IServiceCollection, namespace: string) {

  addStorage(services);
  
  addWinstonChannelLogger(services);

  addWinstonLogger(services, namespace);

  addPackageFileWatcher(services);

}