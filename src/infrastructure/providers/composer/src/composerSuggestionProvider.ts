import { ILogger } from 'domain/logging';
import {
  createPackageResource,
  extractPackageDependenciesFromJson,
  PackageDependency,
  TPackageVersionDescriptor
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
    const packageDescriptors = extractPackageDependenciesFromJson(
      packageText,
      this.config.dependencyProperties
    );

    const packageDependencies = packageDescriptors
      .filter(x => x.hasType("version"))
      .map(
        desc => {
          const versionType = desc.getType("version") as TPackageVersionDescriptor
          return new PackageDependency(
            createPackageResource(
              desc.name,
              versionType.version,
              packagePath
            ),
            desc.nameRange,
            versionType.versionRange
          )
        }
      );

    return packageDependencies;
  }

}