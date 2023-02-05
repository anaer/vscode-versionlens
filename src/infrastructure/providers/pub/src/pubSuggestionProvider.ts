import { ILogger } from 'domain/logging';
import {
  extractPackageDependenciesFromYaml,
  PackageDependency,
  PackageResponse
} from 'domain/packages';
import { AbstractSuggestionProvider } from 'domain/providers';
import { ISuggestionProvider, TSuggestionReplaceFunction } from 'domain/suggestions';
import { PubClient } from './pubClient';
import { PubConfig } from './pubConfig';
import { pubReplaceVersion } from './pubUtils';

export class PubSuggestionProvider
  extends AbstractSuggestionProvider<PubConfig>
  implements ISuggestionProvider {

  client: PubClient;

  suggestionReplaceFn: TSuggestionReplaceFunction;

  constructor(client: PubClient, logger: ILogger) {
    super(client.config, logger);
    this.client = client;
    this.suggestionReplaceFn = pubReplaceVersion
  }

  clearCache () {
    this.client.jsonClient.clearCache();
  };
  
  parseDependencies(
    packagePath: string,
    packageText: string
  ): Array<PackageDependency> {
    const packageDependencies = extractPackageDependenciesFromYaml(
      packagePath,
      packageText,
      this.config.dependencyProperties
    );

    return packageDependencies;
  }

  fetchSuggestions(
    packagePath: string,
    packageDependencies: Array<PackageDependency>
  ): Promise<Array<PackageResponse>> {
    const clientData = null;
    return this.fetchPackages(
      this.client,
      clientData,
      packageDependencies,
    );
  }

}