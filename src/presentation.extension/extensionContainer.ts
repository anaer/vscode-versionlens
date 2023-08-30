import { IServiceProvider } from 'domain/di';
import {
  IDomainServices,
  addAppConfig,
  addCachingOptions,
  addHttpOptions,
  addLoggingOptions,
  addPackagesDependencyCache,
  addProcessesCache,
  addSuggestionDependencyCache,
  addSuggestionProviders
} from 'domain/services';
import { nameOf } from 'domain/utils';
import { AwilixServiceCollectionFactory } from 'infrastructure/di';
import {
  addPackageFileWatcher,
  addWinstonChannelLogger,
  addWinstonLogger
} from 'infrastructure/services';
import {
  VersionLensExtension,
  addEditorDependencyCacheDependencyCache,
  addOnActiveTextEditorChange,
  addOnClearCache,
  addOnFileLinkClick,
  addOnPackageDependenciesUpdated,
  addOnPackageFileUpdated,
  addOnProviderEditorActivated,
  addOnProviderTextDocumentChange,
  addOnShowError,
  addOnTextDocumentChange,
  addOnTogglePrereleases,
  addOnToggleReleases,
  addOnUpdateDependencyClick,
  addOutputChannel,
  addProviderNames,
  addVersionLensExtension,
  addVersionLensProviders
} from 'presentation.extension';
import { ExtensionContext, workspace } from 'vscode';

export async function configureContainer(context: ExtensionContext): Promise<IServiceProvider> {

  const serviceCollectionFactory = new AwilixServiceCollectionFactory();
  const services = serviceCollectionFactory.createServiceCollection();

  services.addSingleton(
    nameOf<IDomainServices>().serviceCollectionFactory,
    serviceCollectionFactory
  );

  // domain
  addAppConfig(services, workspace.getConfiguration, VersionLensExtension.extensionName);

  addHttpOptions(services);

  addCachingOptions(services);

  addLoggingOptions(services);

  addProviderNames(services);

  addSuggestionProviders(services);

  addPackagesDependencyCache(services);

  addSuggestionDependencyCache(services);

  addProcessesCache(services);

  // infrastructure
  addWinstonChannelLogger(services);

  addWinstonLogger(services, "extension");

  addPackageFileWatcher(services);

  // extension
  addVersionLensExtension(services);

  addOutputChannel(services);

  addVersionLensProviders(services);

  addEditorDependencyCacheDependencyCache(services);

  addOnActiveTextEditorChange(services);

  addOnTextDocumentChange(services);

  addOnProviderEditorActivated(services);

  addOnProviderTextDocumentChange(services);

  addOnClearCache(services);

  addOnFileLinkClick(services);

  addOnUpdateDependencyClick(services);

  addOnToggleReleases(services);

  addOnTogglePrereleases(services);

  addOnPackageDependenciesUpdated(services);

  addOnPackageFileUpdated(services);

  addOnShowError(services);

  return await services.build();
}