import { importSuggestionProviders } from "application/providers";
import { IServiceCollection, IServiceProvider } from "domain/di";
import { ILogger } from "domain/logging";
import { ApplicationService } from "./eApplicationService";

export async function addSuggestionProviders(services: IServiceCollection) {
  services.addSingleton(
    ApplicationService.suggestionProviders,
    async (
      serviceProvider: IServiceProvider,
      providerNames: Array<string>,
      logger: ILogger
    ) =>
      await importSuggestionProviders(
        serviceProvider,
        providerNames,
        logger
      )
  )
}

export function addSuggestionProviderNames(services: IServiceCollection) {
  services.addSingleton(
    ApplicationService.providerNames,
    [
      'composer',
      'dotnet',
      'dub',
      'maven',
      'npm',
      'pub',
    ]
  )
}