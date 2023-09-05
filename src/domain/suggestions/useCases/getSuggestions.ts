import { throwUndefinedOrNull } from "@esm-test/guards";
import { ILogger } from "domain/logging";
import { DependencyCache, PackageResponse } from "domain/packages";
import { ISuggestionProvider } from "domain/suggestions";
import { dirname } from 'node:path';

export class GetSuggestions {

  constructor(
    readonly dependencyCaches: DependencyCache[],
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("dependencyCaches", dependencyCaches);
    throwUndefinedOrNull("logger", logger);
  }

  async execute(
    suggestionProvider: ISuggestionProvider,
    projectPath: string,
    packageFilePath: string
  ): Promise<PackageResponse[]> {

    // ensure the caching duration is up to date
    suggestionProvider.config.caching.defrost();
    this.logger.debug(
      "caching duration is set to %s seconds",
      suggestionProvider.config.caching.duration / 1000
    );

    // get the document dependencies
    const packageDeps = DependencyCache.getDependenciesWithFallback(
      suggestionProvider.name,
      packageFilePath,
      ...this.dependencyCaches
    );

    // fetch the package suggestions
    const packagePath = dirname(packageFilePath);
    const suggestions = await suggestionProvider.fetchSuggestions(
      projectPath,
      packagePath,
      packageDeps
    );

    this.logger.info(
      "resolved %s %s package release and pre-release suggestions",
      suggestions.length,
      suggestionProvider.name
    );

    return suggestions;
  }

}