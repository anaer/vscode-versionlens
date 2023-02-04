import {
  asFunction,
  asValue,
  AwilixContainer,
  createContainer,
  InjectionMode
} from 'awilix';
import { AppConfig } from 'domain/configuration';
import * as DomainServiceUtils from "domain/servicesUtils";
import * as InfraServiceUtils from "infrastructure/servicesUtils";
import { addSuggestionProviders } from 'infrastructure/servicesUtils';
import {
  registerIconCommands,
  registerSuggestionCommands,
  TextDocumentEvents,
  TextEditorEvents,
  VersionLensExtension
} from 'presentation.extension';
import { ExtensionContext, window, workspace } from 'vscode';
import { IExtensionServices } from './container/iExtensionServices';
import { registerVersionLensProviders } from './container/registerVersionLensProviders';

export async function configureContainer(
  context: ExtensionContext
): Promise<AwilixContainer<IExtensionServices>> {

  const container: AwilixContainer<IExtensionServices> = createContainer({
    injectionMode: InjectionMode.CLASSIC
  });

  const services = {

    // domain services
    loggingOptions: DomainServiceUtils.addLoggingOptions(),
    httpOptions: DomainServiceUtils.addHttpOptions(),
    cachingOptions: DomainServiceUtils.addCachingOptions(),

    // infrastructure services
    loggerChannel: InfraServiceUtils.addWinstonChannelLogger(),
    logger: InfraServiceUtils.addWinstonLogger("extension"),
    providerNames: InfraServiceUtils.addSuggestionProviderNames(),

    // extension services
    appConfig: asFunction(
      extensionName => new AppConfig(workspace, extensionName.toLowerCase())
    ).singleton(),

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
      await addSuggestionProviders(
        providerNames,
        container,
        logger.child({ namespace: 'registry' })
      )
    ),
  });

  return container;
}