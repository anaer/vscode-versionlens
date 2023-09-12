import { TConfigSectionResolver } from "domain/configuration";
import { IServiceCollection } from "domain/di";
import {
  addAppConfig,
  addCachingOptions,
  addFileSystemStorage,
  addFileWatcherDependencyCache,
  addGetDependencyChangesUseCase,
  addGetSuggestionProviderUseCase,
  addHttpOptions,
  addLoggingOptions,
  addProcessesCache,
  addSuggestionPackageCache,
  addSuggestionProviders
} from ".";

export function addDomainServices(
  services: IServiceCollection,
  configSection: string,
  configResolver: TConfigSectionResolver
) {

  addAppConfig(services, configSection, configResolver);

  addHttpOptions(services);

  addCachingOptions(services);

  addLoggingOptions(services);

  addFileSystemStorage(services);

  addSuggestionProviders(services);

  addFileWatcherDependencyCache(services);

  addSuggestionPackageCache(services);

  addProcessesCache(services);

  addGetSuggestionProviderUseCase(services);

  addGetDependencyChangesUseCase(services);

}