import { KeyDictionary } from 'domain/generics';
import { ILogger } from 'domain/logging';
import {
  createPackageResource,
  createPathDescFromJsonNode,
  createRepoDescFromJsonNode,
  createVersionDescFromJsonNode,
  extractPackageDependenciesFromJson,
  PackageDependency,
  PackageDescriptorType,
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
import { DubClient } from './dubClient';
import { DubConfig } from './dubConfig';

const complexTypeHandlers: KeyDictionary<TJsonPackageTypeHandler> = {
  "version": createVersionDescFromJsonNode,
  "path": createPathDescFromJsonNode,
  "repository": createRepoDescFromJsonNode
};

export class DubSuggestionProvider
  extends SuggestionProvider<DubClient, null>
  implements ISuggestionProvider {

  constructor(client: DubClient, logger: ILogger) {
    super(client, logger);
    this.config = client.config;
    this.suggestionReplaceFn = defaultReplaceFn
  }

  config: DubConfig;

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

    const packageDependencies = [];

    for (const packageDesc of packageDescriptors) {

      // map the version descriptor to a package dependency
      if (packageDesc.hasType(PackageDescriptorType.version)) {
        const versionType = packageDesc.getType<TPackageVersionDescriptor>(
          PackageDescriptorType.version
        );

        packageDependencies.push(
          new PackageDependency(
            createPackageResource(
              packageDesc.name,
              versionType.version,
              packagePath
            ),
            packageDesc.nameRange,
            versionType.versionRange
          )
        );

        continue;
      }

    }

    return packageDependencies;
  }

}