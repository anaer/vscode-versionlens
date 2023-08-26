import { IServiceProvider } from 'domain/di';
import {
  IDomainServices,
  addAppConfig,
  addCachingOptions,
  addChangedPackagesDependencyCache,
  addHttpOptions,
  addLoggingOptions,
  addPackagesDependencyCache,
  addProcessesCache,
  addSuggestionDependencyCache
} from 'domain/services';
import { nameOf } from 'domain/utils';
import { AwilixServiceCollectionFactory } from 'infrastructure/di';
import {
  addPackageDependencyWatcher,
  addWinstonChannelLogger,
  addWinstonLogger
} from 'infrastructure/services';
import {
  VersionLensExtension
} from 'presentation.extension';
import { ExtensionContext, workspace } from 'vscode';
import {
  addAppConfig,
  addIconCommands,
  addOutputChannel,
  addProviderNames,
  addSaveChangesTask,
  addSuggestionCommands,
  addSuggestionProviders,
  addTextEditorEvents,
  addVersionLensExtension,
  addVersionLensProviders
} from './services/serviceUtils';

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

  addChangedPackagesDependencyCache(services);

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

  addTextEditorEvents(services);

  addVersionLensProviders(services);

  addSaveChangesTask(services);

  return await services.build();
}