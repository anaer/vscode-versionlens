import { ILogger } from 'domain/logging';
import {
  extractPackageDependenciesFromJson,
  PackageDependency,
  PackageResponse
} from 'domain/packages';
import { AbstractSuggestionProvider } from 'domain/providers';
import {
  defaultReplaceFn,
  ISuggestionProvider,
  TSuggestionReplaceFunction
} from 'domain/suggestions';
import { ComposerClient } from './composerClient';
import { ComposerConfig } from './composerConfig';

export class ComposerSuggestionProvider
  extends AbstractSuggestionProvider<ComposerConfig>
  implements ISuggestionProvider {

  client: ComposerClient;

  suggestionReplaceFn: TSuggestionReplaceFunction;

  constructor(client: ComposerClient, logger: ILogger) {
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

  async fetchSuggestions(
    packagePath: string,
    packageDependencies: Array<PackageDependency>
  ): Promise<Array<PackageResponse>> {

    const clientData = null;

    return super.fetchPackages(
      this.client,
      clientData,
      packageDependencies,
    );
  }

}