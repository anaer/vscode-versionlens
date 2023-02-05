import { IServiceCollection } from "domain/di";
import { createWinstonLogger, OutputChannelTransport } from "infrastructure/logging";
import { InfrastructureService } from "./eInfrastructureService";

export function addWinstonChannelLogger(services: IServiceCollection) {
  services.addSingleton(
    InfrastructureService.loggerChannel,
    (outputChannel, loggingOptions) =>
      new OutputChannelTransport(outputChannel, loggingOptions)
  );
}

export function addWinstonLogger(services: IServiceCollection, namespace: string) {
  services.addSingleton(
    InfrastructureService.logger,
    loggerChannel => createWinstonLogger(loggerChannel, { namespace })
  );
}