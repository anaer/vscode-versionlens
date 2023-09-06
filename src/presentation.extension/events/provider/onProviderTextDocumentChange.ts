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

    const changedDeps = await this.getDependencyChanges.execute(
      suggestionProvider,
      packageFilePath,
      newContent
    );

    const hasChanges = changedDeps.length > 0;

    if (hasChanges) {
      this.editorDependencyCache.set(
        suggestionProvider.name,
        packageFilePath,
        changedDeps
      );
    }
  }

}