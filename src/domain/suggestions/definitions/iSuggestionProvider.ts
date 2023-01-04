import { ILogger } from "domain/logging";
import { IProviderConfig } from "domain/providers";
import {
  PackageResponse,
  IPackageDependency
} from "domain/packages";

import { TSuggestionReplaceFunction } from "./tSuggestionReplaceFunction";

export interface ISuggestionProvider {

  config: IProviderConfig;

  logger: ILogger;

  suggestionReplaceFn: TSuggestionReplaceFunction;

  parseDependencies(packageText: string): Array<IPackageDependency>;

  fetchSuggestions(
    packagePath: string,
    packageDependencies: Array<IPackageDependency>
  ): Promise<Array<PackageResponse>>;

}