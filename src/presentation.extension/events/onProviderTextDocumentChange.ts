import { throwUndefinedOrNull } from "@esm-test/guards";
import { ILogger } from "domain/logging";
import { DependencyCache } from "domain/packages";
import { ISuggestionProvider } from "domain/suggestions";

export class OnProviderTextDocumentChange {

  constructor(
    readonly editorDependencyCache: DependencyCache,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("editorDependencyCache", editorDependencyCache);
    throwUndefinedOrNull("logger", logger);
  }

  execute(suggestionProvider: ISuggestionProvider, packageFilePath: string, newContent: string) {
    this.logger.silly("%s provider text document change", suggestionProvider.name);

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
  }

}