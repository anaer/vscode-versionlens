import { throwNull, throwUndefined } from "@esm-test/guards";
import { ILogger } from "domain/logging";
import { DependencyCache } from "domain/packages";
import { ISuggestionProvider } from "domain/suggestions";

export class OnProviderTextDocumentChange {

  constructor(
    readonly editorDependencyCache: DependencyCache,
    readonly logger: ILogger
  ) {
    throwUndefined("editorDependencyCache", editorDependencyCache);
    throwNull("editorDependencyCache", editorDependencyCache);

    throwUndefined("logger", logger);
    throwNull("logger", logger);
  }

  execute(providers: ISuggestionProvider[], packageFilePath: string, newContent: string) {
    this.logger.silly("%s provider text document change", providers.map(x => x.name));

    providers.forEach((suggestionProvider: ISuggestionProvider) => {

      // unfreeze config per file request
      suggestionProvider.config.caching.defrost();

      this.logger.silly(
        "Caching duration for %s is set to %s seconds",
        suggestionProvider.name,
        suggestionProvider.config.caching.duration / 1000
      );

      const tempDependencies = suggestionProvider.parseDependencies(
        packageFilePath,
        newContent
      );

      // parse the document text dependencies
      this.editorDependencyCache.set(
        suggestionProvider.name,
        packageFilePath,
        tempDependencies
      );

    });

  }

}