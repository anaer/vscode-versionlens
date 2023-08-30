import { throwUndefinedOrNull } from "@esm-test/guards";
import { ILogger } from "domain/logging";
import { DependencyCache, PackageDependency } from "domain/packages";
import { ISuggestionProvider } from "domain/suggestions";

export class OnPackageFileUpdated {

  constructor(
    readonly editorDependencyCache: DependencyCache,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("editorDependencyCache", editorDependencyCache);
    throwUndefinedOrNull("logger", logger);
  }

  async execute(
    provider: ISuggestionProvider,
    packageFilePath: string,
    packageDeps: PackageDependency[]
  ): Promise<void> {

    // remove the packageFilePath from editor dependency cache
    this.editorDependencyCache.remove(provider.name, packageFilePath);

    this.logger.debug(
      'Cleared editor dependency cache for %s',
      packageFilePath
    );
  }

}