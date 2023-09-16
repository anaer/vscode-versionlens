import { throwUndefinedOrNull } from '@esm-test/guards';
import { ILogger } from 'domain/logging';
import {
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
import { ISuggestionProvider } from 'domain/suggestions';
import { KeyDictionary } from 'domain/utils';
import { ComposerClient } from './composerClient';
import { ComposerConfig } from './composerConfig';

const complexTypeHandlers: KeyDictionary<TJsonPackageTypeHandler> = {
  [PackageDescriptorType.version]: createVersionDescFromJsonNode
};

export class ComposerSuggestionProvider implements ISuggestionProvider {

  readonly name: string = 'composer';

  constructor(
    readonly client: ComposerClient,
    readonly config: ComposerConfig,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("client", client);
    throwUndefinedOrNull("config", config);
    throwUndefinedOrNull("logger", logger);
  }

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