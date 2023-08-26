import { IServiceCollection } from "domain/di";
import { DisposableArray } from "domain/generics";
import { IDomainServices } from "domain/services";
import { nameOf } from "domain/utils";
import {
  IconCommandHandlers,
  SuggestionCodeLensProvider,
  SuggestionCommandHandlers,
  TextEditorEvents,
  VersionLensExtension
} from "presentation.extension";
import { window, workspace } from "vscode";
import { SaveChangesTask } from "../commands/saveChangesTask";
import { IExtensionServices } from "./iExtensionServices";

export function addVersionLensExtension(services: IServiceCollection) {
  const projectPath = workspace.workspaceFolders && workspace.workspaceFolders.length > 0
    ? workspace.workspaceFolders[0].uri.fsPath
    : "";

  services.addSingleton(
    nameOf<IExtensionServices>().extension,
    (container: IDomainServices & IExtensionServices) =>
      new VersionLensExtension(container.appConfig, projectPath)
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
        container.suggestionCache,
        container.processesCache,
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

export function addVersionLensProviders(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IExtensionServices>().versionLensProviders,
    (container: IDomainServices & IExtensionServices) =>
      new DisposableArray(
        container.suggestionProviders.map(
          suggestionProvider => new SuggestionCodeLensProvider(
            container.extension,
            suggestionProvider,
            container.packageDependencyWatcher,
            container.logger.child({ namespace: `${suggestionProvider.name} codelens` })
          )
        )
      ),
    true
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

export function addSaveChangesTask(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IExtensionServices>().saveChangesTask,
    (container: IDomainServices & IExtensionServices) =>
      new SaveChangesTask(
        container.packageDependencyWatcher,
        container.logger.child({ namespace: `save changes task` })
      )
  )
}