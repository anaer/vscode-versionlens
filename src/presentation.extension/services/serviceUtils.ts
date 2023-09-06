import { IServiceCollection } from "domain/di";
import { DisposableArray } from "domain/generics";
import { DependencyCache } from "domain/packages";
import { IDomainServices } from "domain/services";
import { GetSuggestions } from "domain/suggestions";
import { nameOf } from "domain/utils";
import {
  IExtensionServices,
  OnActiveTextEditorChange,
  OnClearCache,
  OnFileLinkClick,
  OnPackageDependenciesChanged,
  OnProviderEditorActivated,
  OnProviderTextDocumentChange,
  OnProviderTextDocumentClose,
  OnProviderTextDocumentSave,
  OnShowError,
  OnTextDocumentChange,
  OnTextDocumentClose,
  OnTextDocumentSave,
  OnTogglePrereleases,
  OnToggleReleases,
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

export function addVersionLensProviders(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IExtensionServices>().versionLensProviders,
    (container: IDomainServices & IExtensionServices) =>
      new DisposableArray(
        container.suggestionProviders.map(
          suggestionProvider => new SuggestionCodeLensProvider(
            container.extension,
            suggestionProvider,
            container.getSuggestions,
            container.logger.child({ namespace: `${suggestionProvider.name}CodeLensProvider` })
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

export function addEditorDependencyCache(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IExtensionServices>().editorDependencyCache,
    (container: IDomainServices) => new DependencyCache(container.providerNames)

  );
}

export function addGetSuggestionsUseCase(services: IServiceCollection) {
  const serviceName = nameOf<IDomainServices>().getSuggestions;
  services.addSingleton(
    serviceName,
    (container: IDomainServices & IExtensionServices) =>
      new GetSuggestions(
        [
          container.editorDependencyCache,
          container.fileWatcherDependencyCache
        ],
        container.logger.child({ namespace: serviceName })
      )
  );
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

export function addOnTextDocumentClosed(services: IServiceCollection) {
  const serviceName = nameOf<IExtensionServices>().onTextDocumentClose;
  services.addSingleton(
    serviceName,
    (container: IDomainServices & IExtensionServices) =>
      new OnTextDocumentClose(
        container.suggestionProviders,
        container.logger.child({ namespace: serviceName })
      ),
    true
  )
}

export function addOnTextDocumentSave(services: IServiceCollection) {
  const serviceName = nameOf<IExtensionServices>().onTextDocumentSave;
  services.addSingleton(
    serviceName,
    (container: IDomainServices & IExtensionServices) =>
      new OnTextDocumentSave(
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
        container.getDependencyChanges,
        container.editorDependencyCache,
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

export function addOnToggleReleases(services: IServiceCollection) {
  const serviceName = nameOf<IExtensionServices>().onToggleReleases;
  services.addSingleton(
    serviceName,
    (container: IDomainServices & IExtensionServices) => {
      return new OnToggleReleases(
        container.versionLensProviders,
        container.extension.state,
        container.logger.child({ namespace: serviceName })
      );
    },
    true
  )
}

export function addOnTogglePrereleases(services: IServiceCollection) {
  const serviceName = nameOf<IExtensionServices>().onTogglePrereleases;
  services.addSingleton(
    serviceName,
    (container: IDomainServices & IExtensionServices) => {
      return new OnTogglePrereleases(
        container.versionLensProviders,
        container.extension.state,
        container.logger.child({ namespace: serviceName })
      );
    },
    true
  )
}

export function addOnShowError(services: IServiceCollection) {
  const serviceName = nameOf<IExtensionServices>().onShowError;
  services.addSingleton(
    serviceName,
    (container: IDomainServices & IExtensionServices) => {
      return new OnShowError(
        container.extension.state,
        container.outputChannel,
        container.logger.child({ namespace: serviceName })
      );
    },
    true
  )
}

export function addOnPackageDependenciesChanged(services: IServiceCollection) {
  const serviceName = nameOf<IExtensionServices>().onPackageDependenciesChanged
  services.addSingleton(
    serviceName,
    (container: IDomainServices & IExtensionServices) => {
      const event = new OnPackageDependenciesChanged(
        container.logger.child({ namespace: serviceName })
      );

      // register listener
      container.packageFileWatcher.registerOnPackageDependenciesChanged(
        event.execute,
        event
      );

      return event;
    }
  )
}

export function addOnProviderTextDocumentClose(services: IServiceCollection) {
  const serviceName = nameOf<IExtensionServices>().onProviderTextDocumentClose
  services.addSingleton(
    serviceName,
    (container: IDomainServices & IExtensionServices) => {
      const event = new OnProviderTextDocumentClose(
        container.editorDependencyCache,
        container.logger.child({ namespace: serviceName })
      );

      // register listener
      container.onTextDocumentClose.registerListener(event.execute, event);

      return event;
    }
  )
}

export function addOnProviderTextDocumentSave(services: IServiceCollection) {
  const serviceName = nameOf<IExtensionServices>().onProviderTextDocumentSave
  services.addSingleton(
    serviceName,
    (container: IDomainServices & IExtensionServices) => {
      const event = new OnProviderTextDocumentSave(
        container.extension.state,
        container.editorDependencyCache,
        container.logger.child({ namespace: serviceName })
      );

      // register listener
      container.onTextDocumentSave.registerListener(event.execute, event);

      return event;
    }
  )
}
