import { TConfigSectionResolver } from "domain/configuration";
import { IServiceCollection } from "domain/di";
import {
  addAppConfig,
  addCachingOptions,
  addFileSystemStorage,
  addFileWatcherDependencyCache,
  addGetDependencyChangesUseCase,
  addHttpOptions,
  addLoggingOptions,
  addProcessesCache,
  addSuggestionPackageCache,
  addSuggestionProviders
} from ".";
import { TConfigSectionResolver } from "domain/configuration";

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

  addGetDependencyChangesUseCase(services);

}