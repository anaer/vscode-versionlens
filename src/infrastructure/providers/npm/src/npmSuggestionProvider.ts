import { ILogger } from 'domain/logging';
import {
  extractPackageDependenciesFromJson,
  PackageDependency
} from 'domain/packages';
import { SuggestionProvider } from 'domain/providers';
import { ISuggestionProvider, TSuggestionReplaceFunction } from 'domain/suggestions';
import { NpmPackageClient } from './clients/npmPackageClient';
import { TNpmClientData } from './definitions/tNpmClientData';
import { NpmConfig } from './npmConfig';
import { npmReplaceVersion } from './npmUtils';

export class NpmSuggestionProvider
  extends SuggestionProvider<NpmPackageClient, TNpmClientData>
  implements ISuggestionProvider {

  constructor(client: NpmPackageClient, logger: ILogger) {
    super(client, logger);
    this.config = client.config;
    this.suggestionReplaceFn = npmReplaceVersion;
  }

  config: NpmConfig;

  suggestionReplaceFn: TSuggestionReplaceFunction;

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

  protected async preFetchSuggestions(
    projectPath: string,
    packagePath: string
  ): Promise<TNpmClientData> {
    if (this.config.github.accessToken &&
      this.config.github.accessToken.length > 0) {
      // defrost github parameters
      this.config.github.defrost();
    }

    return { projectPath }
  }

}