import { IServiceProvider } from 'domain/di';
import {
  IDomainServices,
  addCachingOptions,
  addChangedPackagesDependencyCache,
  addHttpOptions,
  addLoggingOptions,
  addPackagesDependencyCache
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
import { ExtensionContext } from 'vscode';
import {
  addAppConfig,
  addIconCommands,
  addOutputChannel,
  addProviderNames,
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
  addAppConfig(services, VersionLensExtension.extensionName.toLowerCase());

  addHttpOptions(services);

  addCachingOptions(services);

  addLoggingOptions(services);

  addProviderNames(services);

  addSuggestionProviders(services);

  addPackagesDependencyCache(services);

  addChangedPackagesDependencyCache(services);

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

  addEditedPackagesCache(services);

  return await services.build();
}