import { IServiceProvider } from 'domain/di';
import { IDomainServices, addDomainServices } from 'domain/services';
import { nameOf } from 'domain/utils';
import { AwilixServiceCollectionFactory } from 'infrastructure/di';
import { addInfrastructureServices } from 'infrastructure/services';
import {
  VersionLensExtension,
  addEditorDependencyCache,
  addGetSuggestionsUseCase,
  addOnActiveTextEditorChange,
  addOnClearCache,
  addOnFileLinkClick,
  addOnPackageDependenciesChanged,
  addOnPreSaveChanges,
  addOnProviderEditorActivated,
  addOnProviderTextDocumentChange,
  addOnProviderTextDocumentClose,
  addOnSaveChanges,
  addOnShowError,
  addOnTextDocumentChange,
  addOnTextDocumentClosed,
  addOnTextDocumentSave,
  addOnTogglePrereleases,
  addOnToggleReleases,
  addOnUpdateDependencyClick,
  addOutputChannel,
  addProviderNames,
  addSuggestionOptions,
  addVersionLensExtension,
  addVersionLensProviders,
  addVersionLensState
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
  addDomainServices(
    services,
    VersionLensExtension.extensionName,
    workspace.getConfiguration
  );

  // infrastructure
  addInfrastructureServices(services, "extension");

  // extension
  addSuggestionOptions(services);

  addVersionLensState(services);

  addVersionLensExtension(services);

  addProviderNames(services);

  addOutputChannel(services);

  addVersionLensProviders(services);

  addEditorDependencyCache(services);

  addGetSuggestionsUseCase(services);

  addOnActiveTextEditorChange(services);

  addOnTextDocumentChange(services);

  addOnTextDocumentClosed(services);

  addOnTextDocumentSave(services);

  addOnProviderEditorActivated(services);

  addOnProviderTextDocumentChange(services);

  addOnProviderTextDocumentClose(services);

  addOnClearCache(services);

  addOnPreSaveChanges(services);

  addOnSaveChanges(services);

  addOnFileLinkClick(services);

  addOnUpdateDependencyClick(services);

  addOnToggleReleases(services);

  addOnTogglePrereleases(services);

  addOnPackageDependenciesChanged(services);

  addOnShowError(services);

  return await services.build();
}