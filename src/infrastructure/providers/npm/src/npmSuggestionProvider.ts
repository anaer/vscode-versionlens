import { KeyDictionary } from 'domain/generics';
import { ILogger } from 'domain/logging';
import {
  createPackageResource,
  createVersionDescFromJsonNode,
  extractPackageDependenciesFromJson,
  PackageDependency,
  PackageDescriptorType,
  TJsonPackageParserOptions,
  TJsonPackageTypeHandler,
  TPackageVersionDescriptor
} from 'domain/packages';
import { SuggestionProvider } from 'domain/providers';
import { ISuggestionProvider, TSuggestionReplaceFunction } from 'domain/suggestions';
import { NpmPackageClient } from './clients/npmPackageClient';
import { TNpmClientData } from './definitions/tNpmClientData';
import { NpmConfig } from './npmConfig';
import { npmReplaceVersion } from './npmUtils';

const complexTypeHandlers: KeyDictionary<TJsonPackageTypeHandler> = {
  "version": createVersionDescFromJsonNode
};

export class NpmSuggestionProvider
  extends SuggestionProvider<NpmPackageClient, TNpmClientData>
  implements ISuggestionProvider {

  constructor(client: NpmPackageClient, logger: ILogger) {
    super(client, logger);
    this.config = client.config;
    this.suggestionReplaceFn = npmReplaceVersion;
  }

  config: NpmConfig;

  suggestionReplaceFn: TSuggestionReplaceFunction;

  clearCache() {
    this.client.pacoteClient.cache.clear();
    this.client.githubClient.jsonClient.clearCache();
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

      // handle any pnpm override dependency selectors in the name
      let name = packageDesc.name;
      const atIndex = name.indexOf('@');
      if (atIndex > 0) {
        name = name.slice(0, atIndex);
      }

      // map the version descriptor to a package dependency
      if (packageDesc.hasType(PackageDescriptorType.version)) {
        const versionType = packageDesc.getType<TPackageVersionDescriptor>(
          PackageDescriptorType.version
        );

        packageDependencies.push(
          new PackageDependency(
            createPackageResource(
              name,
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

  protected async preFetchSuggestions(
    projectPath: string,
    packagePath: string
  ): Promise<TNpmClientData> {
    if (this.config.github.accessToken &&
      this.config.github.accessToken.length > 0) {
      // defrost github parameters
      this.config.github.defrost();
    }

    return { projectPath }
  }

}