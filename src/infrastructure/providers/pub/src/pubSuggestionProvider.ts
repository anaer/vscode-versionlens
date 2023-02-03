import { fetchPackages } from 'application/packages';
import { ILogger } from 'domain/logging';
import {
  extractPackageDependenciesFromYaml,
  PackageDependency,
  PackageResponse
} from 'domain/packages';
import { ISuggestionProvider, TSuggestionReplaceFunction } from 'domain/suggestions';
import { PubClient } from './pubClient';
import { PubConfig } from './pubConfig';
import { pubReplaceVersion } from './pubUtils';

export class PubSuggestionProvider implements ISuggestionProvider {

  client: PubClient;

  config: PubConfig;

  logger: ILogger

  suggestionReplaceFn: TSuggestionReplaceFunction;

  constructor(client: PubClient, logger: ILogger) {
    this.client = client;
    this.config = client.config;
    this.logger = logger;
    this.suggestionReplaceFn = pubReplaceVersion
  }

  parseDependencies(packageText: string): Array<PackageDependency> {
    const packageDependencies = extractPackageDependenciesFromYaml(
      packageText,
      this.config.dependencyProperties
    );

    return packageDependencies;
  }

  async fetchSuggestions(
    packagePath: string,
    packageDependencies: Array<PackageDependency>
  ): Promise<Array<PackageResponse>> {

    // this.customReplaceFn = pubReplaceVersion.bind(yamlText);

    const clientData = null;
    return fetchPackages(
      packagePath,
      this.client,
      clientData,
      packageDependencies,
    );
  }

}