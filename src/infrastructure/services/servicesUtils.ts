import { IServiceCollection, ServiceInjectionMode } from "domain/di";
import { ILoggingOptions } from "domain/logging";
import { DomainService } from "domain/services";
import { nameOf } from "domain/utils";
import { createWinstonLogger, OutputChannelTransport } from "infrastructure/logging";

export function addWinstonChannelLogger(services: IServiceCollection) {
  services.addSingleton(
    nameOf<DomainService>().loggerChannel,
    (outputChannel, loggingOptions: ILoggingOptions) =>
      new OutputChannelTransport(
        outputChannel,
        loggingOptions
      ),
    ServiceInjectionMode.classic
  );
}

export function addWinstonLogger(services: IServiceCollection, namespace: string) {
  services.addSingleton(
    nameOf<DomainService>().logger,
    (container: DomainService) =>
      createWinstonLogger(container.loggerChannel, { namespace }),
    ServiceInjectionMode.proxy
  );
}