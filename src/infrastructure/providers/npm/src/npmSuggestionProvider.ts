import { fetchPackages } from 'application/packages';
import { ILogger } from 'domain/logging';
import {
  extractPackageDependenciesFromJson,
  PackageDependency,
  PackageResponse
} from 'domain/packages';
import { ISuggestionProvider, TSuggestionReplaceFunction } from 'domain/suggestions';
import { NpmPackageClient } from './clients/npmPackageClient';
import { NpmConfig } from './npmConfig';
import { npmReplaceVersion } from './npmUtils';

export class NpmSuggestionProvider implements ISuggestionProvider {

  config: NpmConfig;

  client: NpmPackageClient;

  logger: ILogger;

  suggestionReplaceFn: TSuggestionReplaceFunction;

  constructor(client: NpmPackageClient, logger: ILogger) {
    this.client = client;
    this.config = client.config;
    this.logger = logger;
    this.suggestionReplaceFn = npmReplaceVersion;
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

    if (this.config.github.accessToken &&
      this.config.github.accessToken.length > 0) {
      // defrost github parameters
      this.config.github.defrost();
    }

    const clientData = null;
    return fetchPackages(
      packagePath,
      this.client,
      clientData,
      packageDependencies,
    );
  }

}