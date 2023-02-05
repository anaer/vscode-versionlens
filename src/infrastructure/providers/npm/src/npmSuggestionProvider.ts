import { ILogger } from 'domain/logging';
import {
  extractPackageDependenciesFromJson,
  PackageDependency,
  PackageResponse
} from 'domain/packages';
import { AbstractSuggestionProvider } from 'domain/providers';
import { ISuggestionProvider, TSuggestionReplaceFunction } from 'domain/suggestions';
import { NpmPackageClient } from './clients/npmPackageClient';
import { NpmConfig } from './npmConfig';
import { npmReplaceVersion } from './npmUtils';

export class NpmSuggestionProvider
  extends AbstractSuggestionProvider<NpmConfig>
  implements ISuggestionProvider {

  client: NpmPackageClient;

  suggestionReplaceFn: TSuggestionReplaceFunction;

  constructor(client: NpmPackageClient, logger: ILogger) {
    super(client.config, logger);
    this.client = client;
    this.suggestionReplaceFn = npmReplaceVersion;
  }

  clearCache() {
    this.client.pacoteClient.cache.clear();
    this.client.githubClient.jsonClient.clearCache();
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

    if (this.config.github.accessToken &&
      this.config.github.accessToken.length > 0) {
      // defrost github parameters
      this.config.github.defrost();
    }

    const clientData = null;
    return this.fetchPackages(
      this.client,
      clientData,
      packageDependencies,
    );
  }

}