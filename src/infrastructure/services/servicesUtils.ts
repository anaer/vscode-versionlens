import { IServiceCollection, ServiceInjectionMode } from "domain/di";
import { ILoggingOptions } from "domain/logging";
import { IDomainServices } from "domain/services";
import { nameOf } from "domain/utils";
import { OutputChannelTransport, createWinstonLogger } from "infrastructure/logging";
import { FileSystemStorage } from "infrastructure/storage";
import { PackageFileWatcher } from "infrastructure/watcher";
import { IInfrastructureServices } from "./infrastructureServices";

export function addStorage(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IInfrastructureServices>().storage,
    () => new FileSystemStorage()
  )
}

export function addWinstonChannelLogger(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDomainServices>().loggerChannel,
    (outputChannel, loggingOptions: ILoggingOptions) =>
      new OutputChannelTransport(
        outputChannel,
        loggingOptions
      ),
    false,
    ServiceInjectionMode.classic
  );
}

export function addWinstonLogger(services: IServiceCollection, namespace: string) {
  services.addSingleton(
    nameOf<IDomainServices>().logger,
    (container: IDomainServices) =>
      createWinstonLogger(container.loggerChannel, { namespace })
  );
}

export function addPackageFileWatcher(services: IServiceCollection) {
  const serviceName = nameOf<IDomainServices>().packageFileWatcher;
  services.addSingleton(
    serviceName,
    (container: IInfrastructureServices & IDomainServices) =>
      new PackageFileWatcher(
        container.storage,
        container.suggestionProviders,
        container.dependencyCache,
        container.logger.child({ namespace: serviceName })
      ),
    true
  );
}