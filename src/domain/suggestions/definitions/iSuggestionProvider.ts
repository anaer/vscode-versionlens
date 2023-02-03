import { PackageDependency, PackageResponse } from "domain/packages";
import { IProvider } from "domain/providers";
import { TSuggestionReplaceFunction } from "./tSuggestionReplaceFunction";

export interface ISuggestionProvider extends IProvider {

  suggestionReplaceFn: TSuggestionReplaceFunction;

  parseDependencies(
    packagePath: string,
    packageText: string
  ): Array<PackageDependency>;

  fetchSuggestions(
    packagePath: string,
    packageDependencies: Array<PackageDependency>
  ): Promise<Array<PackageResponse>>;

  clearCache: () => void;

}