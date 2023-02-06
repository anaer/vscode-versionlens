import { ILogger } from 'domain/logging';
import {
  extractPackageDependenciesFromYaml,
  PackageDependency
} from 'domain/packages';
import { AbstractSuggestionProvider } from 'domain/providers';
import { ISuggestionProvider, TSuggestionReplaceFunction } from 'domain/suggestions';
import { PubClient } from './pubClient';
import { PubConfig } from './pubConfig';
import { pubReplaceVersion } from './pubUtils';

export class PubSuggestionProvider
  extends AbstractSuggestionProvider<PubConfig, PubClient, any>
  implements ISuggestionProvider {

  suggestionReplaceFn: TSuggestionReplaceFunction;

  constructor(client: PubClient, logger: ILogger) {
    super(client.config, client, logger);
    this.suggestionReplaceFn = pubReplaceVersion
  }

  clearCache() {
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

}