import { KeyDictionary } from 'domain/generics';
import { ILogger } from 'domain/logging';
import {
  createPackageResource,
  createVersionDescFromJsonNode,
  extractPackageDependenciesFromJson,
  PackageDependency,
  TJsonPackageParserOptions,
  TJsonPackageTypeHandler,
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

const complexTypeHandlers: KeyDictionary<TJsonPackageTypeHandler> = {
  "version": createVersionDescFromJsonNode
};

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

    const options: TJsonPackageParserOptions = {
      includePropNames: this.config.dependencyProperties,
      complexTypeHandlers
    };

    const packageDescriptors = extractPackageDependenciesFromJson(
      packageText,
      options
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