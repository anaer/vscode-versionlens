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
  addIconCommands,
  addOnActiveTextEditorChange,
  addOnProviderEditorActivated,
  addOnProviderTextDocumentChange,
  addOnTextDocumentChange,
  addOutputChannel,
  addProviderNames,
  addSaveChangesTask,
  addSuggestionCommands,
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

  addIconCommands(services);

  addSuggestionCommands(services);

  addOnActiveTextEditorChange(services);

  addOnTextDocumentChange(services);

  addOnProviderEditorActivated(services);

  addOnProviderTextDocumentChange(services);

  addVersionLensProviders(services);

  addSaveChangesTask(services);

  addTempDependencyCache(services);

  return await services.build();
}