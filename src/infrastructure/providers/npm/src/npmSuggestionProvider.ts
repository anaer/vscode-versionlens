import { ILogger } from 'domain/logging';
import {
  extractPackageDependenciesFromJson,
  PackageDependency
} from 'domain/packages';
import { AbstractSuggestionProvider } from 'domain/providers';
import { ISuggestionProvider, TSuggestionReplaceFunction } from 'domain/suggestions';
import { NpmPackageClient } from './clients/npmPackageClient';
import { NpmConfig } from './npmConfig';
import { npmReplaceVersion } from './npmUtils';

export class NpmSuggestionProvider
  extends AbstractSuggestionProvider<NpmConfig, NpmPackageClient, null>
  implements ISuggestionProvider {

  suggestionReplaceFn: TSuggestionReplaceFunction;

  constructor(client: NpmPackageClient, logger: ILogger) {
    super(client.config, client, logger);
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

  protected async preFetchSuggestions(packagePath: string): Promise<any> {
    if (this.config.github.accessToken &&
      this.config.github.accessToken.length > 0) {
      // defrost github parameters
      this.config.github.defrost();
    }
  }

}