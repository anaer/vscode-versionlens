import { throwNull, throwUndefined } from "@esm-test/guards";
import { ILogger } from "domain/logging";
import { DependencyCache, IPackageDependencyWatcher, PackageDependency } from "domain/packages";
import { ISuggestionProvider } from "domain/suggestions";

export class OnPackageFileUpdated {

  constructor(
    readonly packageDependencyWatcher: IPackageDependencyWatcher,
    readonly editorDependencyCache: DependencyCache,
    readonly logger: ILogger
  ) {
    throwUndefined("packageDependencyWatcher", packageDependencyWatcher);
    throwNull("packageDependencyWatcher", packageDependencyWatcher);

    throwUndefined("editorDependencyCache", editorDependencyCache);
    throwNull("editorDependencyCache", editorDependencyCache);

    throwUndefined("logger", logger);
    throwNull("logger", logger);

    // run execute when a change is detected
    packageDependencyWatcher.registerOnPackageFileUpdated(this.execute.bind(this));
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