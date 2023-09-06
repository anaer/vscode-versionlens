import { throwUndefinedOrNull } from "@esm-test/guards";
import { ILogger } from "domain/logging";
import { DependencyCache } from "domain/packages";
import { ISuggestionProvider } from "domain/suggestions";
import { VersionLensState } from "presentation.extension";

export class OnProviderTextDocumentSave {

  constructor(
    readonly state: VersionLensState,
    readonly editorDependencyCache: DependencyCache,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("state", state);
    throwUndefinedOrNull("editorDependencyCache", editorDependencyCache);
    throwUndefinedOrNull("logger", logger);
  }

  async execute(provider: ISuggestionProvider, packageFilePath: string): Promise<void> {
    // remove the packageFilePath from editor dependency cache
    this.editorDependencyCache.remove(provider.name, packageFilePath);

    this.logger.debug(
      'cleared editor dependency cache for %s',
      packageFilePath
    );
  }

}