import { ILogger } from "domain/logging";
import { PackageDependency, PackageResponse } from "domain/packages";
import { IProviderConfig } from "domain/providers";
import { TSuggestionReplaceFunction } from "./tSuggestionReplaceFunction";

export interface ISuggestionProvider {

  name: string;

  config: IProviderConfig;

  logger: ILogger;

  suggestionReplaceFn?: TSuggestionReplaceFunction;

  parseDependencies(
    packagePath: string,
    packageText: string
  ): Array<PackageDependency>;

  fetchSuggestions(
    projectPath: string,
    packagePath: string,
    packageDependencies: Array<PackageDependency>
  ): Promise<Array<PackageResponse>>;

}