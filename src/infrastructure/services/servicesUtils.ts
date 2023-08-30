import { IServiceCollection, ServiceInjectionMode } from "domain/di";
import { ILoggingOptions } from "domain/logging";
import { IDomainServices } from "domain/services";
import { nameOf } from "domain/utils";
import { OutputChannelTransport, createWinstonLogger } from "infrastructure/logging";
import { PackageFileWatcher } from "infrastructure/watcher";

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
  services.addSingleton(
    nameOf<IDomainServices>().packageFileWatcher,
    (container: IDomainServices) =>
      new PackageFileWatcher(
        container.suggestionProviders,
        container.dependencyCache,
        container.logger.child({ namespace: 'package dependency watcher' })
      ),
    true
  );
}