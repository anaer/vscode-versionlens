import { ILogger } from 'domain/logging';
import { ISuggestionProvider, TSuggestionReplaceFunction } from 'domain/suggestions';
import {
  extractPackageDependenciesFromYaml,
  RequestFactory,
  IPackageDependency,
  PackageResponse
} from 'domain/packages';

import { PubConfig } from './pubConfig';
import { PubClient } from './pubClient';
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

  parseDependencies(packageText: string): Array<IPackageDependency> {
    const packageDependencies = extractPackageDependenciesFromYaml(
      packageText,
      this.config.dependencyProperties
    );

    return packageDependencies;
  }

  async fetchSuggestions(
    packagePath: string,
    packageDependencies: Array<IPackageDependency>
  ): Promise<Array<PackageResponse>> {

    // this.customReplaceFn = pubReplaceVersion.bind(yamlText);

    const clientData = null;
    return RequestFactory.executeDependencyRequests(
      packagePath,
      this.client,
      clientData,
      packageDependencies,
    );
  }

}