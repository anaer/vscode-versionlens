import { IPackageDependency, PackageResponse } from "domain/packages";
import { IProvider } from "domain/providers/definitions/iProvider";
import { TSuggestionReplaceFunction } from "./tSuggestionReplaceFunction";

export interface ISuggestionProvider extends IProvider {

  suggestionReplaceFn: TSuggestionReplaceFunction;

  parseDependencies(packageText: string): Array<IPackageDependency>;

  fetchSuggestions(
    packagePath: string,
    packageDependencies: Array<IPackageDependency>
  ): Promise<Array<PackageResponse>>;

}