import { ApplicationService } from "application/services";
import { Config } from "domain/configuration";
import { IServiceCollection } from "domain/di";
import { DomainService } from "domain/services";
import { nameOf } from "domain/utils";
import {
  IconCommandHandlers,
  SuggestionCommandHandlers,
  TextDocumentEvents,
  TextEditorEvents,
  VersionLensExtension,
  VersionLensProvider
} from "presentation.extension";
import { window, workspace } from "vscode";
import { ExtensionService } from "./extensionService";

export function addAppConfig(services: IServiceCollection, appName: string) {
  services.addSingleton(
    nameOf<DomainService>().appConfig,
    () => new Config(workspace.getConfiguration, appName)
  )
}

export function addVersionLensExtension(services: IServiceCollection) {
  const projectPath = workspace.workspaceFolders[0].uri.fsPath;

  services.addSingleton(
    nameOf<ExtensionService>().extension,
    (container: ApplicationService & DomainService & ExtensionService) =>
      new VersionLensExtension(
        container.appConfig,
        projectPath,
        container.providerNames
      )
  )
}

export function addOutputChannel(services: IServiceCollection) {
  services.addSingleton(
    nameOf<ExtensionService>().outputChannel,
    // vscode output channel called "VersionLens"
    () => window.createOutputChannel(
      VersionLensExtension.extensionName
    )
  )
}

export function addIconCommands(services: IServiceCollection) {
  services.addSingleton(
    nameOf<ExtensionService>().iconCommandHandlers,
    (container: DomainService & ExtensionService) =>
      new IconCommandHandlers(
        container.extension.state,
        container.outputChannel,
        container.versionLensProviders,
        container.logger.child({ namespace: 'icon commands' })
      )
  )
}

export function addSuggestionCommands(services: IServiceCollection) {
  services.addSingleton(
    nameOf<ExtensionService>().suggestionCommandHandlers,
    (container: DomainService & ExtensionService) =>
      new SuggestionCommandHandlers(
        container.extension.state,
        container.logger.child({ namespace: 'suggestion commands' })
      )
  )
}

export function addTextEditorEvents(services: IServiceCollection) {
  services.addSingleton(
    nameOf<ExtensionService>().textEditorEvents,
    (container: ApplicationService & DomainService & ExtensionService) =>
      new TextEditorEvents(
        container.extension.state,
        container.suggestionProviders,
        container.loggerChannel
      )
  )
}

export function addTextDocumentEvents(services: IServiceCollection) {
  services.addSingleton(
    nameOf<ExtensionService>().textDocumentEvents,
    (container: DomainService & ExtensionService) =>
      new TextDocumentEvents(
        container.extension.state,
        container.versionLensProviders,
        container.logger.child({ namespace: 'text document event' })
      )
  )
}

export function addVersionLensProviders(services: IServiceCollection) {
  services.addSingleton(
    nameOf<ExtensionService>().versionLensProviders,
    (container: ApplicationService & DomainService & ExtensionService) =>
      container.suggestionProviders.map(
        suggestionProvider =>
          new VersionLensProvider(
            container.extension,
            suggestionProvider,
            container.logger.child({ namespace: `${suggestionProvider.name} codelens` })
          )
      )
  )
}
