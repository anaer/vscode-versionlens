import { ILogger } from 'domain/logging';
import {
  extractPackageDependenciesFromJson,
  PackageDependency,
  PackageResponse
} from 'domain/packages';
import { AbstractSuggestionProvider } from 'domain/providers/abstractSuggestionProvider';
import {
  defaultReplaceFn,
  ISuggestionProvider,
  TSuggestionReplaceFunction
} from 'domain/suggestions';
import { DubClient } from './dubClient';
import { DubConfig } from './dubConfig';

export class DubSuggestionProvider
  extends AbstractSuggestionProvider<DubConfig>
  implements ISuggestionProvider {

  client: DubClient;

  suggestionReplaceFn: TSuggestionReplaceFunction;

  constructor(client: DubClient, logger: ILogger) {
    super(client.config, logger);
    this.client = client;

    this.suggestionReplaceFn = defaultReplaceFn
  }

  clearCache() {
    this.client.jsonClient.clearCache();
  }

  parseDependencies(
    packagePath: string,
    packageText: string
  ): Array<PackageDependency> {
    const packageDependencies = extractPackageDependenciesFromJson(
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