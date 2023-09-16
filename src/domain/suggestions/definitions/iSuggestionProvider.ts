import { ILogger } from "domain/logging";
import { IPackageClient, PackageDependency } from "domain/packages";
import { IProviderConfig } from "domain/providers";
import { TSuggestionReplaceFunction } from "./tSuggestionReplaceFunction";

export interface ISuggestionProvider {

  name: string;

  config: IProviderConfig;

  client: IPackageClient<any>

  logger: ILogger;

  suggestionReplaceFn?: TSuggestionReplaceFunction;

  parseDependencies(packagePath: string, packageText: string): Array<PackageDependency>;

  /**
   * Optional function called before queueing all suggestion fetch requests.
   * Providers can return custom client data that will be sent with each suggestion fetch request
   * @param packagePath 
   */
  preFetchSuggestions?(
    projectPath: string,
    packagePath: string
  ): Promise<any>;

}