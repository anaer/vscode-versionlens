import { KeyDictionary } from 'domain/generics';
import { ILogger } from 'domain/logging';
import {
  PackageCache,
  PackageDependency,
  PackageDescriptorType,
  TJsonPackageParserOptions,
  TJsonPackageTypeHandler,
  TPackageNameDescriptor,
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
  [PackageDescriptorType.version]: createVersionDescFromJsonNode
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

  parseDependencies(packagePath: string, packageText: string): Array<PackageDependency> {

    const options: TJsonPackageParserOptions = {
      includePropNames: this.config.dependencyProperties,
      complexTypeHandlers
    };

    const packageDescriptors = extractPackageDependenciesFromJson(
      packageText,
      options
    );

    const packageDependencies = packageDescriptors
      .filter(x => x.hasType(PackageDescriptorType.version))
      .map(
        packageDesc => {
          const nameDesc = packageDesc.getType<TPackageNameDescriptor>(
            PackageDescriptorType.name
          );

          const versionDesc = packageDesc.getType<TPackageVersionDescriptor>(
            PackageDescriptorType.version
          );

          return new PackageDependency(
            createPackageResource(
              nameDesc.name,
              versionDesc.version,
              packagePath
            ),
            nameDesc.nameRange,
            versionDesc.versionRange,
            packageDesc
          )
        }
      );

    return packageDependencies;
  }

}