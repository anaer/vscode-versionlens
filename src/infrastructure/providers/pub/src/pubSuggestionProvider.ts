import { ILogger } from 'domain/logging';
import {
  createPackageResource,
  extractPackageDependenciesFromYaml,
  PackageDependency,
  TPackageVersionLocationDescriptor
} from 'domain/packages';
import { SuggestionProvider } from 'domain/providers';
import { ISuggestionProvider, TSuggestionReplaceFunction } from 'domain/suggestions';
import { PubClient } from './pubClient';
import { PubConfig } from './pubConfig';
import { pubReplaceVersion } from './pubUtils';

export class PubSuggestionProvider
  extends SuggestionProvider<PubClient, any>
  implements ISuggestionProvider {

  constructor(client: PubClient, logger: ILogger) {
    super(client, logger);
    this.config = client.config;
    this.suggestionReplaceFn = pubReplaceVersion
  }

  config: PubConfig;

  suggestionReplaceFn: TSuggestionReplaceFunction;

  clearCache() {
    this.client.jsonClient.clearCache();
  };

  parseDependencies(
    packagePath: string,
    packageText: string
  ): Array<PackageDependency> {
    const packageLocations = extractPackageDependenciesFromYaml(
      packageText,
      this.config.dependencyProperties
    );

    const packageDependencies = packageLocations
    .filter(x => x.types[0].type === "version")
    .map(
      loc => {
        const versionType = loc.types[0] as TPackageVersionLocationDescriptor
        return new PackageDependency(
          createPackageResource(
            loc.name,
            versionType.version,
            packagePath
          ),
          loc.nameRange,
          versionType.versionRange
        )
      }
    );

    return packageDependencies;
  }

}