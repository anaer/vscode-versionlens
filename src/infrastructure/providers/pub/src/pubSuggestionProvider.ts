import { ILogger } from 'domain/logging';
import {
  PackageCache,
  PackageDependency,
  PackageDescriptorType,
  TPackageGitDescriptor,
  TPackagePathDescriptor,
  TPackageVersionDescriptor,
  TYamlPackageParserOptions,
  createGitDescFromYamlNode,
  createHostedDescFromYamlNode,
  createPackageResource,
  createPathDescFromYamlNode,
  createVersionDescFromYamlNode,
  extractPackageDependenciesFromYaml
} from 'domain/packages';
import {
  ISuggestionProvider,
  SuggestionProvider,
  TSuggestionReplaceFunction
} from 'domain/suggestions';
import { PubClient } from './pubClient';
import { PubConfig } from './pubConfig';
import { pubReplaceVersion } from './pubUtils';

const complexTypeHandlers = {
  [PackageDescriptorType.version]: createVersionDescFromYamlNode,
  [PackageDescriptorType.path]: createPathDescFromYamlNode,
  [PackageDescriptorType.hosted]: createHostedDescFromYamlNode,
  [PackageDescriptorType.git]: createGitDescFromYamlNode
}

export class PubSuggestionProvider
  extends SuggestionProvider<PubClient, any>
  implements ISuggestionProvider {

  constructor(client: PubClient, packageCache: PackageCache, logger: ILogger) {
    super(client, packageCache, logger);
    this.config = client.config;
    this.suggestionReplaceFn = pubReplaceVersion
  }

  config: PubConfig;

  suggestionReplaceFn: TSuggestionReplaceFunction;

  parseDependencies(
    packagePath: string,
    packageText: string
  ): Array<PackageDependency> {

    const options: TYamlPackageParserOptions = {
      includePropNames: this.config.dependencyProperties,
      complexTypeHandlers
    };

    const packageDescriptors = extractPackageDependenciesFromYaml(
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
            versionType.versionRange,
            packageDesc
          )
        );

        continue;
      }

      // map the path descriptor to a package dependency
      if (packageDesc.hasType(PackageDescriptorType.path)) {
        const pathType = packageDesc.getType<TPackagePathDescriptor>(
          PackageDescriptorType.path
        );

        packageDependencies.push(
          new PackageDependency(
            createPackageResource(
              packageDesc.name,
              pathType.path,
              packagePath
            ),
            packageDesc.nameRange,
            pathType.pathRange,
            packageDesc
          )
        );
      }

      // map the git descriptor to a package dependency
      if (packageDesc.hasType(PackageDescriptorType.git)) {
        const gitType = packageDesc.getType<TPackageGitDescriptor>(
          PackageDescriptorType.git
        );

        packageDependencies.push(
          new PackageDependency(
            createPackageResource(
              packageDesc.name,
              gitType.gitUrl,
              packagePath
            ),
            packageDesc.nameRange,
            packageDesc.nameRange,
            packageDesc
          )
        );

        continue;
      }

    } // end map loop

    return packageDependencies;
  }

}