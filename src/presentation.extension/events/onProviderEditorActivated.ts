import { ILogger, ILoggerChannel } from "domain/logging";
import { DependencyCache } from "domain/packages";
import { ISuggestionProvider } from "domain/suggestions";
import { TextDocument } from "vscode";

export class OnProviderEditorActivated {

  constructor(
    readonly dependencyCache: DependencyCache,
    readonly tempDependencyCache: DependencyCache,
    readonly loggerChannel: ILoggerChannel,
    readonly logger: ILogger,
  ) {
  }

  execute(activeProviders: ISuggestionProvider[], document: TextDocument) {
    this.logger.debug("%s provider editors activated", activeProviders.map(x => x.name));

    // ensure the latest logging level is set
    this.loggerChannel.refreshLoggingLevel();

    // ensure the temp dependency cache is set
    activeProviders.forEach((provider: ISuggestionProvider) => {

      const tempDeps = this.tempDependencyCache.get(
        provider.config.providerName,
        document.uri.fsPath
      );

      if (tempDeps) return;

      // get the store deps
      const savedDeps = this.dependencyCache.get(
        provider.config.providerName,
        document.uri.fsPath
      );

      if (savedDeps) {
        // update temp cache
        this.tempDependencyCache.set(
          provider.config.providerName,
          document.uri.fsPath,
          savedDeps
        );

        return;
      }

      const parsedDeps = provider.parseDependencies(
        document.uri.fsPath,
        document.getText()
      );

      // update temp cache
      this.tempDependencyCache.set(
        provider.config.providerName,
        document.uri.fsPath,
        parsedDeps
      );
    })

  }

}