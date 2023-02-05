import { AppConfig } from "domain/configuration";
import { IServiceCollection } from "domain/di";
import { ILogger } from "domain/logging";
import { registerIconCommands, registerSuggestionCommands, TextDocumentEvents, TextEditorEvents, VersionLensExtension, VersionLensProvider } from "presentation.extension";
import { ExtensionContext, OutputChannel, window, workspace } from "vscode";
import { registerVersionLensProviders } from ".";
import { ExtensionService } from "./eExtensionService";

export function addExtensionName(services: IServiceCollection, extensionName: string) {
  services.addSingleton(
    ExtensionService.extensionName,
    extensionName
  )
}

export function addAppConfig(services: IServiceCollection) {
  services.addSingleton(
    ExtensionService.appConfig,
    // TODO pass workspace.getConfiguration only 
    extensionName => new AppConfig(workspace, extensionName.toLowerCase())
  )
}

export function addVersionLensExtension(services: IServiceCollection) {
  services.addSingleton(
    ExtensionService.extension,
    (appConfig, providerNames) => new VersionLensExtension(appConfig, providerNames)
  )
}

export function addOutputChannel(services: IServiceCollection) {
  services.addSingleton(
    ExtensionService.outputChannel,
    // vscode output channel called "VersionLens"
    extensionName => window.createOutputChannel(extensionName)
  )
}

export function addSubscriptions(services: IServiceCollection, context: ExtensionContext) {
  services.addSingleton(
    ExtensionService.subscriptions,
    context.subscriptions
  )
}

export function addIconCommands(services: IServiceCollection) {
  services.addSingleton(
    ExtensionService.iconCommands,
    (
      extension: VersionLensExtension,
      versionLensProviders: VersionLensProvider[],
      subscriptions: Array<any>,
      outputChannel: OutputChannel,
      logger: ILogger
    ) =>
      registerIconCommands(
        extension.state,
        versionLensProviders,
        subscriptions,
        outputChannel,
        logger.child({ namespace: 'icon commands' })
      )
  )
}

export function addSuggestionCommands(services: IServiceCollection) {
  services.addSingleton(
    ExtensionService.suggestionCommands,
    (extension, subscriptions, logger) =>
      registerSuggestionCommands(
        extension.state,
        subscriptions,
        logger.child({ namespace: 'suggestion commands' })
      )
  )
}

export function addTextEditorEvents(services: IServiceCollection) {
  services.addSingleton(
    ExtensionService.textEditorEvents,
    (extension, suggestionProviders, loggerChannel) =>
      new TextEditorEvents(
        extension.state,
        suggestionProviders,
        loggerChannel
      )
  )
}

export function addTextDocumentEvents(services: IServiceCollection) {
  services.addSingleton(
    ExtensionService.textDocumentEvents,
    (extension, suggestionProviders, logger) =>
      new TextDocumentEvents(
        extension.state,
        suggestionProviders,
        logger.child({ namespace: 'text document event' })
      )
  )
}

export function addVersionLensProviders(services: IServiceCollection) {
  services.addSingleton(
    ExtensionService.versionLensProviders,
    (extension, suggestionProviders, subscriptions, logger) =>
      registerVersionLensProviders(
        extension,
        suggestionProviders,
        subscriptions,
        logger
      )
  )
}
