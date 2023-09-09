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
  createPathDescFromJsonNode,
  createRepoDescFromJsonNode,
  createVersionDescFromJsonNode,
  extractPackageDependenciesFromJson
} from 'domain/packages';
import {
  ISuggestionProvider,
  SuggestionProvider
} from 'domain/suggestions';
import { KeyDictionary } from 'domain/utils';
import { DubClient } from './dubClient';
import { DubConfig } from './dubConfig';

const complexTypeHandlers: KeyDictionary<TJsonPackageTypeHandler> = {
  [PackageDescriptorType.version]: createVersionDescFromJsonNode,
  [PackageDescriptorType.path]: createPathDescFromJsonNode,
  "repository": createRepoDescFromJsonNode
};

export class DubSuggestionProvider
  extends SuggestionProvider<null>
  implements ISuggestionProvider {

  constructor(client: DubClient, packageCache: PackageCache, logger: ILogger) {
    super(client, packageCache, logger);
    this.config = client.config;
  }

  config: DubConfig;

  parseDependencies(packagePath: string, packageText: string): Array<PackageDependency> {

    const options: TJsonPackageParserOptions = {
      includePropNames: this.config.dependencyProperties,
      complexTypeHandlers
    };

    const packageDescriptors = extractPackageDependenciesFromJson(
      packageText,
      options
    );

    const packageDependencies = [];

    for (const packageDesc of packageDescriptors) {

      // map the version descriptor to a package dependency
      if (packageDesc.hasType(PackageDescriptorType.version)) {
        const nameDesc = packageDesc.getType<TPackageNameDescriptor>(
          PackageDescriptorType.name
        );

        const versionDesc = packageDesc.getType<TPackageVersionDescriptor>(
          PackageDescriptorType.version
        );

        packageDependencies.push(
          new PackageDependency(
            createPackageResource(
              nameDesc.name,
              versionDesc.version,
              packagePath
            ),
            nameDesc.nameRange,
            versionDesc.versionRange,
            packageDesc
          )
        );

        continue;
      }

    }

    return packageDependencies;
  }

}