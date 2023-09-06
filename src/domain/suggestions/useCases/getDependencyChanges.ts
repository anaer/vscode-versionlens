import { throwUndefinedOrNull } from "@esm-test/guards";
import { ILogger } from "domain/logging";
import { DependencyCache, PackageDependency, hasPackageDepsChanged } from "domain/packages";
import { IStorage } from "domain/storage";
import { ISuggestionProvider } from "domain/suggestions";

export class GetDependencyChanges {

  constructor(
    readonly storage: IStorage,
    readonly fileWatcherDependencyCache: DependencyCache,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("fileWatcherDependencyCache", fileWatcherDependencyCache);
    throwUndefinedOrNull("logger", logger);
  }

  async execute(
    suggestionProvider: ISuggestionProvider,
    packageFilePath: string,
    fileContent: string = undefined
  ): Promise<PackageDependency[]> {
    // get the cached parsed dependencies
    const currentDeps = this.fileWatcherDependencyCache.get(
      suggestionProvider.name,
      packageFilePath
    ) || [];

    // parse dependencies from the file content 
    const content = fileContent ?
      fileContent :
      await this.storage.readFile(packageFilePath);

    const latestDeps = suggestionProvider.parseDependencies(packageFilePath, content);

    // check if there is a change
    const hasChanged = hasPackageDepsChanged(currentDeps, latestDeps);

    // return the latest dependencies or an empty array
    return hasChanged ? latestDeps : [];
  }

}