import { IServiceCollection } from "domain/di";
import { DisposableArray } from "domain/generics";
import { DependencyCache } from "domain/packages";
import { IDomainServices } from "domain/services";
import { nameOf } from "domain/utils";
import {
  IExtensionServices,
  IconCommandHandlers,
  OnActiveTextEditorChange,
  OnClearCache,
  OnFileLinkClick,
  OnProviderEditorActivated,
  OnProviderTextDocumentChange,
  OnSaveChanges,
  OnTextDocumentChange,
  OnUpdateDependencyClick,
  SuggestionCodeLensProvider,
  VersionLensExtension
} from "presentation.extension";
import { window, workspace } from "vscode";

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

export function addOnActiveTextEditorChange(services: IServiceCollection) {
  const serviceName = nameOf<IExtensionServices>().onActiveTextEditorChange;
  services.addSingleton(
    serviceName,
    (container: IDomainServices & IExtensionServices) =>
      new OnActiveTextEditorChange(
        container.extension.state,
        container.suggestionProviders,
        container.logger.child({ namespace: serviceName })
      ),
    true
  )
}

export function addOnTextDocumentChange(services: IServiceCollection) {
  const serviceName = nameOf<IExtensionServices>().onTextDocumentChange;
  services.addSingleton(
    serviceName,
    (container: IDomainServices & IExtensionServices) =>
      new OnTextDocumentChange(
        container.suggestionProviders,
        container.logger.child({ namespace: serviceName })
      ),
    true
  )
}

export function addOnProviderEditorActivated(services: IServiceCollection) {
  const serviceName = nameOf<IExtensionServices>().onProviderEditorActivated;
  services.addSingleton(
    serviceName,
    (container: IDomainServices & IExtensionServices) => {
      const listener = new OnProviderEditorActivated(
        container.dependencyCache,
        container.tempDependencyCache,
        container.loggerChannel,
        container.logger.child({ namespace: serviceName })
      );

      // register listener
      container.onActiveTextEditorChange.registerListener(listener.execute, listener);
      return listener;
    },
    false
  )
}

export function addOnProviderTextDocumentChange(services: IServiceCollection) {
  const serviceName = nameOf<IExtensionServices>().onProviderTextDocumentChange;
  services.addSingleton(
    serviceName,
    (container: IDomainServices & IExtensionServices) => {
      const listener = new OnProviderTextDocumentChange(
        container.tempDependencyCache,
        container.logger.child({ namespace: serviceName })
      );

      // register listener
      container.onTextDocumentChange.registerListener(listener.execute, listener);
      return listener;
    },
    false
  )
}

export function addOnClearCache(services: IServiceCollection) {
  const serviceName = nameOf<IExtensionServices>().onClearCache;
  services.addSingleton(
    serviceName,
    (container: IDomainServices & IExtensionServices) => {
      return new OnClearCache(
        container.packageCache,
        container.processesCache,
        container.logger.child({ namespace: serviceName })
      );
    },
    true
  )
}

export function addOnFileLinkClick(services: IServiceCollection) {
  const serviceName = nameOf<IExtensionServices>().onFileLinkClick;
  services.addSingleton(
    serviceName,
    (container: IDomainServices) => {
      return new OnFileLinkClick(
        container.logger.child({ namespace: serviceName })
      );
    },
    true
  )
}

export function addOnUpdateDependencyClick(services: IServiceCollection) {
  const serviceName = nameOf<IExtensionServices>().onUpdateDependencyClick;
  services.addSingleton(
    serviceName,
    (container: IDomainServices) => {
      return new OnUpdateDependencyClick(
        container.logger.child({ namespace: serviceName })
      );
    },
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
            container.tempDependencyCache,
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
  const serviceName = nameOf<IExtensionServices>().onSaveChanges
  services.addSingleton(
    serviceName,
    (container: IDomainServices & IExtensionServices) =>
      new OnSaveChanges(
        container.packageDependencyWatcher,
        container.logger.child({ namespace: serviceName })
      )
  )
}

export function addTempDependencyCache(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IExtensionServices>().tempDependencyCache,
    (container: IDomainServices & IExtensionServices) =>
      new DependencyCache(container.providerNames)
  )
}