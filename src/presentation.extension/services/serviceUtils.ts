import { Config } from "domain/configuration";
import { IServiceCollection } from "domain/di";
import { DisposableArray } from "domain/generics";
import { importSuggestionProviders } from "domain/providers";
import { IDomainServices } from "domain/services";
import { nameOf } from "domain/utils";
import {
  IconCommandHandlers,
  SuggestionCodeLensProvider,
  SuggestionCommandHandlers,
  TextDocumentEvents,
  TextEditorEvents,
  VersionLensExtension
} from "presentation.extension";
import { window, workspace } from "vscode";
import { IExtensionServices } from "./iExtensionServices";

export function addAppConfig(services: IServiceCollection, appName: string) {
  services.addSingleton(
    nameOf<IDomainServices>().appConfig,
    () => new Config(workspace.getConfiguration, appName)
  )
}

export function addVersionLensExtension(services: IServiceCollection) {
  const projectPath = workspace.workspaceFolders && workspace.workspaceFolders.length > 0
    ? workspace.workspaceFolders[0].uri.fsPath
    : "";

  services.addSingleton(
    nameOf<IExtensionServices>().extension,
    (container: IDomainServices & IExtensionServices) =>
      new VersionLensExtension(
        container.appConfig,
        projectPath,
        container.providerNames
      )
  )
}

export function addOutputChannel(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IExtensionServices>().outputChannel,
    // vscode output channel called "VersionLens"
    () => window.createOutputChannel(VersionLensExtension.extensionName)
  )
}

export function addIconCommands(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IExtensionServices>().iconCommandHandlers,
    (container: IDomainServices & IExtensionServices) =>
      new IconCommandHandlers(
        container.extension.state,
        container.outputChannel,
        container.versionLensProviders,
        container.logger.child({ namespace: 'icon commands' })
      ),
    true
  )
}

export function addSuggestionCommands(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IExtensionServices>().suggestionCommandHandlers,
    (container: IDomainServices & IExtensionServices) =>
      new SuggestionCommandHandlers(
        container.suggestionProviders,
        container.extension.state,
        container.logger.child({ namespace: 'suggestion commands' })
      ),
    true
  )
}

export function addTextEditorEvents(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IExtensionServices>().textEditorEvents,
    (container: IDomainServices & IExtensionServices) =>
      new TextEditorEvents(
        container.extension.state,
        container.suggestionProviders,
        container.loggerChannel,
        container.logger
      ),
    true
  )
}

export function addTextDocumentEvents(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IExtensionServices>().textDocumentEvents,
    (container: IDomainServices & IExtensionServices) =>
      new TextDocumentEvents(
        container.extension.state,
        container.versionLensProviders,
        container.logger.child({ namespace: 'text document event' })
      )
  )
}

export function addVersionLensProviders(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IExtensionServices>().versionLensProviders,
    (container: IDomainServices & IExtensionServices) =>
      new DisposableArray(
        container.suggestionProviders.map(
          suggestionProvider => new SuggestionCodeLensProvider(
            container.extension,
            suggestionProvider,
            container.logger.child({ namespace: `${suggestionProvider.name} codelens` })
          )
        )
      ),
    true
  )
}

export async function addSuggestionProviders(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDomainServices>().suggestionProviders,
    async (container: IDomainServices) => {
      return await importSuggestionProviders(
        container.serviceProvider,
        container.providerNames,
        container.logger
      )
    }
  )
}

export function addProviderNames(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDomainServices>().providerNames,
    [
      'composer',
      'dotnet',
      'dub',
      'maven',
      'npm',
      'pub',
    ]
  )
}