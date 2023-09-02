import { IServiceProvider } from 'domain/di';
import {
  IDomainServices,
  addAppConfig,
  addCachingOptions,
  addGetSuggestionsUseCase,
  addHttpOptions,
  addLoggingOptions,
  addPackagesDependencyCache,
  addProcessesCache,
  addSuggestionDependencyCache,
  addSuggestionProviders
} from 'domain/services';
import { nameOf } from 'domain/utils';
import { AwilixServiceCollectionFactory } from 'infrastructure/di';
import { addInfrastructureServices } from 'infrastructure/services/container';
import {
  VersionLensExtension,
  addEditorDependencyCacheDependencyCache,
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

  addPackagesDependencyCache(services);

  addSuggestionDependencyCache(services);

  addProcessesCache(services);

  addGetSuggestionsUseCase(services);

  // infrastructure
  addInfrastructureServices(services, "extension");

  // extension
  addVersionLensExtension(services);

  addOutputChannel(services);

  addVersionLensProviders(services);

  addEditorDependencyCacheDependencyCache(services);

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