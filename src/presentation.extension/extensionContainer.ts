import {
  addCachingOptions,
  addHttpOptions,
  addLoggingOptions,
  addSuggestionProviderNames,
  addWinstonChannelLogger,
  addWinstonLogger
} from 'application/serviceUtils';
import { getSuggestionProviders } from 'application/suggestions/getSuggestionProviders';
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
      appConfig => new VersionLensExtension(appConfig)
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
      await getSuggestionProviders(
        providerNames,
        container,
        logger.child({ namespace: 'registry' })
      )
    ),
  });

  return container;
}