import { KeyDictionary } from 'domain/generics';
import { ILogger } from 'domain/logging';
import {
  PackageCache,
  PackageDependency,
  TJsonPackageParserOptions,
  TJsonPackageTypeHandler,
  TPackageVersionDescriptor,
  createPackageResource,
  createVersionDescFromJsonNode,
  extractPackageDependenciesFromJson
} from 'domain/packages';
import {
  ISuggestionProvider,
  SuggestionProvider,
  TSuggestionReplaceFunction,
  defaultReplaceFn
} from 'domain/suggestions';
import { ComposerClient } from './composerClient';
import { ComposerConfig } from './composerConfig';

const complexTypeHandlers: KeyDictionary<TJsonPackageTypeHandler> = {
  "version": createVersionDescFromJsonNode
};

export class ComposerSuggestionProvider
  extends SuggestionProvider<null>
  implements ISuggestionProvider {

  constructor(client: ComposerClient, packageCache: PackageCache, logger: ILogger) {
    super(client, packageCache, logger);
    this.config = client.config;
    this.suggestionReplaceFn = defaultReplaceFn
  }

  config: ComposerConfig;

  suggestionReplaceFn: TSuggestionReplaceFunction;

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