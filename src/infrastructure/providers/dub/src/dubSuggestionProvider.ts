import { ILogger } from 'domain/logging';
import {
  extractPackageDependenciesFromJson,
  PackageDependency
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
  extends AbstractSuggestionProvider<DubConfig, DubClient, null>
  implements ISuggestionProvider {

  suggestionReplaceFn: TSuggestionReplaceFunction;

  constructor(client: DubClient, logger: ILogger) {
    super(client.config, client, logger);
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

}