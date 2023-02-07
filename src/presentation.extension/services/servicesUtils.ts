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
import { ExtensionContext, window, workspace } from "vscode";
import { ExtensionService } from "./extensionService";

export function addExtensionName(services: IServiceCollection, extensionName: string) {
  services.addSingleton(
    nameOf<ExtensionService>().extensionName,
    extensionName
  )
}

export function addAppConfig(services: IServiceCollection, appName: string) {
  services.addSingleton(
    nameOf<DomainService>().appConfig,
    () => new Config(workspace.getConfiguration, appName)
  )
}

export function addVersionLensExtension(services: IServiceCollection) {
  services.addSingleton(
    nameOf<ExtensionService>().extension,
    (container: ApplicationService & DomainService & ExtensionService) =>
      new VersionLensExtension(
        container.appConfig,
        container.providerNames
      )
  )
}

export function addOutputChannel(services: IServiceCollection) {
  services.addSingleton(
    nameOf<ExtensionService>().outputChannel,
    // vscode output channel called "VersionLens"
    (container: ExtensionService) =>
      window.createOutputChannel(container.extensionName)
  )
}

export function addSubscriptions(services: IServiceCollection, context: ExtensionContext) {
  services.addSingleton(
    nameOf<ExtensionService>().subscriptions,
    context.subscriptions
  )
}

export function addIconCommands(services: IServiceCollection) {
  services.addSingleton(
    nameOf<ExtensionService>().iconCommandHandlers,
    (container: DomainService & ExtensionService) => {
      const instance = new IconCommandHandlers(
        container.extension.state,
        container.outputChannel,
        container.versionLensProviders,
        container.logger.child({ namespace: 'icon commands' })
      )
      container.subscriptions.push(instance);
      return instance;
    }
  )
}

export function addSuggestionCommands(services: IServiceCollection) {
  services.addSingleton(
    nameOf<ExtensionService>().suggestionCommandHandlers,
    (container: DomainService & ExtensionService) => {
      const instance = new SuggestionCommandHandlers(
        container.extension.state,
        container.logger.child({ namespace: 'suggestion commands' })
      )
      container.subscriptions.push(instance);
      return instance;
    }
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
        suggestionProvider => {
          const instance = new VersionLensProvider(
            container.extension,
            suggestionProvider,
            container.logger.child({ namespace: `${suggestionProvider.name} codelens` })
          );

          container.subscriptions.push(instance);

          return instance;
        }
      )
  )
}
