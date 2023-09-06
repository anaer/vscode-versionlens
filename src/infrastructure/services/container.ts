import { IServiceCollection } from "domain/di";
import {
  addPackageFileWatcher,
  addWinstonChannelLogger,
  addWinstonLogger,
  addWorkspaceAdapter
} from ".";

export function addInfrastructureServices(services: IServiceCollection, namespace: string) {

  addWorkspaceAdapter(services);

  addWinstonChannelLogger(services);

  addWinstonLogger(services, namespace);

  addPackageFileWatcher(services);

}