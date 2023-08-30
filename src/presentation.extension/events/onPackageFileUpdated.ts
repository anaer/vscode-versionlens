import { throwUndefinedOrNull } from "@esm-test/guards";
import { ILogger } from "domain/logging";
import { DependencyCache, IPackageFileWatcher, PackageDependency } from "domain/packages";
import { ISuggestionProvider } from "domain/suggestions";

export class OnPackageFileUpdated {

  constructor(
    readonly packageFileWatcher: IPackageFileWatcher,
    readonly editorDependencyCache: DependencyCache,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("packageFileWatcher", packageFileWatcher);
    throwUndefinedOrNull("editorDependencyCache", editorDependencyCache);
    throwUndefinedOrNull("logger", logger);

    // run execute when a change is detected
    packageFileWatcher.registerOnPackageFileUpdated(this.execute.bind(this));
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