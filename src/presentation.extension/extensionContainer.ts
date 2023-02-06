import {
  addSuggestionProviderNames,
  addSuggestionProviders
} from 'application/services';
import { IServiceProvider } from 'domain/di';

import {
  addCachingOptions,
  addHttpOptions,
  addLoggingOptions
} from 'domain/services';
import { AwilixServiceCollection } from 'infrastructure/di';
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
  addExtensionName,
  addIconCommands,
  addOutputChannel,
  addSubscriptions,
  addSuggestionCommands,
  addTextDocumentEvents,
  addTextEditorEvents,
  addVersionLensExtension,
  addVersionLensProviders
} from './services';

export async function configureContainer(
  context: ExtensionContext
): Promise<IServiceProvider> {

  const services = new AwilixServiceCollection();

  // application
  addSuggestionProviderNames(services);

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
  addExtensionName(services, VersionLensExtension.extensionName);


  addVersionLensExtension(services);

  addOutputChannel(services);

  addSubscriptions(services, context);

  addIconCommands(services);

  addSuggestionCommands(services);

  addTextEditorEvents(services);

  addTextDocumentEvents(services);

  addVersionLensProviders(services);

  return await services.build();
}