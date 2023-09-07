import { throwUndefinedOrNull } from "@esm-test/guards";
import { ILogger } from "domain/logging";
import { DependencyCache } from "domain/packages";
import { GetDependencyChanges, ISuggestionProvider } from "domain/suggestions";

export class OnProviderTextDocumentChange {

  constructor(
    readonly getDependencyChanges: GetDependencyChanges,
    readonly editorDependencyCache: DependencyCache,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("getDependencyChanges", getDependencyChanges);
    throwUndefinedOrNull("editorDependencyCache", editorDependencyCache);
    throwUndefinedOrNull("logger", logger);
  }

  async execute(suggestionProvider: ISuggestionProvider, packageFilePath: string, newContent: string): Promise<void> {
    this.logger.silly("%s provider text document change", suggestionProvider.name);

    const result = await this.getDependencyChanges.execute(
      suggestionProvider,
      packageFilePath,
      newContent
    );

    // update the editor cache
    this.editorDependencyCache.set(
      suggestionProvider.name,
      packageFilePath,
      result.parsedDependencies
    );

    this.logger.debug("has changes = %s", result.hasChanged);
  }

}