import { IServiceProvider } from 'domain/di';
import {
  IDomainServices,
  addAppConfig,
  addCachingOptions,
  addFileWatcherDependencyCache,
  addHttpOptions,
  addLoggingOptions,
  addProcessesCache,
  addSuggestionPackageCache,
  addSuggestionProviders,
} from 'domain/services';
import { nameOf } from 'domain/utils';
import { AwilixServiceCollectionFactory } from 'infrastructure/di';
import { addInfrastructureServices } from 'infrastructure/services/container';
import {
  VersionLensExtension,
  addEditorDependencyCache,
  addGetSuggestionsUseCase,
  addOnActiveTextEditorChange,
  addOnClearCache,
  addOnFileLinkClick,
  addOnPackageDependenciesChanged,
  addOnProviderEditorActivated,
  addOnProviderTextDocumentChange,
  addOnProviderTextDocumentClose,
  addOnShowError,
  addOnTextDocumentChange,
  addOnTextDocumentClosed,
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

  addSuggestionPackageCache(services);

  addProcessesCache(services);

  // infrastructure
  addInfrastructureServices(services, "extension");

  // extension
  addVersionLensExtension(services);

  addOutputChannel(services);

  addVersionLensProviders(services);

  addFileWatcherDependencyCache(services);

  addEditorDependencyCache(services);

  addGetSuggestionsUseCase(services);

  addOnActiveTextEditorChange(services);

  addOnTextDocumentChange(services);

  addOnTextDocumentClosed(services);

  addOnProviderEditorActivated(services);

  addOnProviderTextDocumentChange(services);

  addOnClearCache(services);

  addOnFileLinkClick(services);

  addOnUpdateDependencyClick(services);

  addOnToggleReleases(services);

  addOnTogglePrereleases(services);

  addOnPackageDependenciesChanged(services);

  addOnProviderTextDocumentClose(services);

  addOnShowError(services);

  return await services.build();
}