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
  addPackageDependencyWatcher,
  addWinstonChannelLogger,
  addWinstonLogger
} from 'infrastructure/services';
import {
  VersionLensExtension,
  addOnActiveTextEditorChange,
  addOnClearCache,
  addOnFileLinkClick,
  addOnProviderEditorActivated,
  addOnProviderTextDocumentChange,
  addOnSaveChanges,
  addOnShowError,
  addOnTextDocumentChange,
  addOnTogglePrereleases,
  addOnToggleReleases,
  addOnUpdateDependencyClick,
  addOutputChannel,
  addProviderNames,
  addTempDependencyCache,
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

  addPackageDependencyWatcher(services);

  // extension
  addVersionLensExtension(services);

  addOutputChannel(services);

  addVersionLensProviders(services);

  addTempDependencyCache(services);

  addOnActiveTextEditorChange(services);

  addOnTextDocumentChange(services);

  addOnProviderEditorActivated(services);

  addOnProviderTextDocumentChange(services);

  addOnClearCache(services);

  addOnFileLinkClick(services);

  addOnUpdateDependencyClick(services);

  addOnToggleReleases(services);

  addOnTogglePrereleases(services);

  addOnSaveChanges(services);

  addOnShowError(services);

  return await services.build();
}