import { ILogger } from 'domain/logging';
import {
  createPackageResource,
  extractPackageDependenciesFromJson,
  PackageDependency,
  TPackageVersionLocationDescriptor
} from 'domain/packages';
import { SuggestionProvider } from 'domain/providers';
import {
  defaultReplaceFn,
  ISuggestionProvider,
  TSuggestionReplaceFunction
} from 'domain/suggestions';
import { ComposerClient } from './composerClient';
import { ComposerConfig } from './composerConfig';

export class ComposerSuggestionProvider
  extends SuggestionProvider<ComposerClient, any>
  implements ISuggestionProvider {

  constructor(client: ComposerClient, logger: ILogger) {
    super(client, logger);
    this.config = client.config;
    this.suggestionReplaceFn = defaultReplaceFn
  }

  config: ComposerConfig;

  suggestionReplaceFn: TSuggestionReplaceFunction;

  clearCache() {
    this.client.jsonClient.clearCache();
  }

  parseDependencies(
    packagePath: string,
    packageText: string
  ): Array<PackageDependency> {
    const packageLocations = extractPackageDependenciesFromJson(
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