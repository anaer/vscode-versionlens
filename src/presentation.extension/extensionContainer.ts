import { createAllSuggestionProviders } from 'application/providers';
import {
  addCachingOptions,
  addHttpOptions,
  addLoggingOptions,
  addSuggestionProviderNames,
  addWinstonChannelLogger,
  addWinstonLogger
} from 'application/serviceUtils';
import {
  asFunction,
  asValue,
  AwilixContainer,
  createContainer,
  InjectionMode
} from 'awilix';
import { AppConfig } from 'domain/configuration';
import {
  registerIconCommands,
  registerSuggestionCommands,
  TextDocumentEvents,
  TextEditorEvents,
  VersionLensExtension
} from 'presentation.extension';
import { ExtensionContext, window, workspace } from 'vscode';
import { registerVersionLensProviders } from './container/registerVersionLensProviders';
import { IExtensionServices } from './definitions/iExtensionServices';

export async function configureContainer(
  context: ExtensionContext
): Promise<AwilixContainer<IExtensionServices>> {

  const container: AwilixContainer<IExtensionServices> = createContainer({
    injectionMode: InjectionMode.CLASSIC
  });

  const services = {

    // application services

    appConfig: asFunction(
      extensionName => new AppConfig(workspace, extensionName.toLowerCase())
    ).singleton(),

    loggingOptions: addLoggingOptions(),

    httpOptions: addHttpOptions(),

    cachingOptions: addCachingOptions(),

    loggerChannel: addWinstonChannelLogger(),

    logger: addWinstonLogger("extension"),

    providerNames: addSuggestionProviderNames(),

    // extension services

    extensionName: asValue(VersionLensExtension.extensionName),

    extension: asFunction(
      (appConfig, providerNames) => new VersionLensExtension(appConfig, providerNames)
    ).singleton(),

    outputChannel: asFunction(
      // vscode output channel called "VersionLens"
      extensionName => window.createOutputChannel(extensionName)
    ).singleton(),

    // commands
    subscriptions: asValue(context.subscriptions),

    iconCommands: asFunction(
      (extension, versionLensProviders, subscriptions, outputChannel, logger) =>
        registerIconCommands(
          extension.state,
          versionLensProviders,
          subscriptions,
          outputChannel,
          logger.child({ namespace: 'icon commands' })
        )
    ).singleton(),

    suggestionCommands: asFunction(
      (extension, subscriptions, logger) =>
        registerSuggestionCommands(
          extension.state,
          subscriptions,
          logger.child({ namespace: 'suggestion commands' })
        )
    ).singleton(),

    // events
    textEditorEvents: asFunction(
      (extension, suggestionProviders, loggerChannel) =>
        new TextEditorEvents(
          extension.state,
          suggestionProviders,
          loggerChannel
        )
    ).singleton(),

    TextDocumentEvents: asFunction(
      (extension, suggestionProviders, logger) =>
        new TextDocumentEvents(
          extension.state,
          suggestionProviders,
          logger.child({ namespace: 'text document event' })
        )
    ).singleton(),

    // version lenses
    versionLensProviders: asFunction(
      (extension, suggestionProviders, subscriptions, logger) =>
        registerVersionLensProviders(
          extension,
          suggestionProviders,
          subscriptions,
          logger
        )
    )

  };

  // register the services
  container.register(services);

  // register async suggestionProviders
  const { logger, providerNames } = container.cradle;
  container.register({
    suggestionProviders: asValue(
      await createAllSuggestionProviders(
        providerNames,
        container,
        logger.child({ namespace: 'registry' })
      )
    ),
  });

  return container;
}