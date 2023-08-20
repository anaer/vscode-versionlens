import { IServiceProvider } from 'domain/di';
import {
  IDomainServices,
  addCachingOptions,
  addHttpOptions,
  addLoggingOptions
} from 'domain/services';
import { nameOf } from 'domain/utils';
import { AwilixServiceCollectionFactory } from 'infrastructure/di';
import {
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
  addTextDocumentEvents,
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

  // application
  addProviderNames(services);

  addSuggestionProviders(services);

  // domain
  addAppConfig(services, VersionLensExtension.extensionName.toLowerCase());

  addHttpOptions(services);

  addCachingOptions(services);

  addLoggingOptions(services);

  // infrastructure
  addWinstonChannelLogger(services);

  addWinstonLogger(services, "extension");

  // extension
  addVersionLensExtension(services);

  addOutputChannel(services);

  addIconCommands(services);

  addSuggestionCommands(services);

  addTextEditorEvents(services);

  addTextDocumentEvents(services);

  addVersionLensProviders(services);

  return await services.build();
}