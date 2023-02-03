import { fetchPackages } from 'application/packages';
import { ILogger } from 'domain/logging';
import {
  extractPackageDependenciesFromJson,
  PackageDependency,
  PackageResponse
} from 'domain/packages';
import {
  defaultReplaceFn,
  ISuggestionProvider,
  TSuggestionReplaceFunction
} from 'domain/suggestions';
import { ComposerClient } from './composerClient';
import { ComposerConfig } from './composerConfig';

export class ComposerSuggestionProvider implements ISuggestionProvider {

  client: ComposerClient;

  config: ComposerConfig;

  logger: ILogger;

  suggestionReplaceFn: TSuggestionReplaceFunction;

  constructor(client: ComposerClient, logger: ILogger) {
    this.client = client;
    this.config = client.config;
    this.logger = logger;
    this.suggestionReplaceFn = defaultReplaceFn
  }

  parseDependencies(packageText: string): Array<PackageDependency> {
    const packageDependencies = extractPackageDependenciesFromJson(
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

    return fetchPackages(
      packagePath,
      this.client,
      clientData,
      packageDependencies,
    );
  }

}