import { importSuggestionProviders } from "application/providers";
import { IServiceCollection, ServiceInjectionMode } from "domain/di";
import { DomainService } from "domain/services/domainService";
import { nameOf } from "domain/utils";
import { ApplicationService } from "./applicationService";

export async function addSuggestionProviders(services: IServiceCollection) {
  services.addSingleton(
    nameOf<ApplicationService>().suggestionProviders,
    async (container: ApplicationService & DomainService) => {
      return await importSuggestionProviders(
        container.serviceProvider,
        container.providerNames,
        container.logger
      )},
    ServiceInjectionMode.proxy
  )
}

export function addSuggestionProviderNames(services: IServiceCollection) {
  services.addSingleton(
    nameOf<ApplicationService>().providerNames,
    [
      'composer',
      'dotnet',
      'dub',
      'maven',
      'npm',
      'pub',
    ]
  ),
    ServiceInjectionMode.proxy
}