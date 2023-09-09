import { ILogger } from 'domain/logging';
import {
  PackageCache,
  PackageDependency,
  PackageDescriptorType,
  TPackageGitDescriptor,
  TPackageNameDescriptor,
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
import { ISuggestionProvider, SuggestionProvider } from 'domain/suggestions';
import { PubClient } from './pubClient';
import { PubConfig } from './pubConfig';

const complexTypeHandlers = {
  [PackageDescriptorType.version]: createVersionDescFromYamlNode,
  [PackageDescriptorType.path]: createPathDescFromYamlNode,
  [PackageDescriptorType.hosted]: createHostedDescFromYamlNode,
  [PackageDescriptorType.git]: createGitDescFromYamlNode
}

export class PubSuggestionProvider
  extends SuggestionProvider<null>
  implements ISuggestionProvider {

  constructor(client: PubClient, packageCache: PackageCache, logger: ILogger) {
    super(client, packageCache, logger);
    this.config = client.config;
  }

  config: PubConfig;

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
      const nameDesc = packageDesc.getType<TPackageNameDescriptor>(
        PackageDescriptorType.name
      );

      // map the version descriptor to a package dependency
      if (packageDesc.hasType(PackageDescriptorType.version)) {
        const versionType = packageDesc.getType<TPackageVersionDescriptor>(
          PackageDescriptorType.version
        );

        packageDependencies.push(
          new PackageDependency(
            createPackageResource(
              nameDesc.name,
              versionType.version,
              packagePath
            ),
            nameDesc.nameRange,
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
              nameDesc.name,
              pathType.path,
              packagePath
            ),
            nameDesc.nameRange,
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
              nameDesc.name,
              gitType.gitUrl,
              packagePath
            ),
            nameDesc.nameRange,
            nameDesc.nameRange,
            packageDesc
          )
        );

        continue;
      }

    } // end map loop

    return packageDependencies;
  }

}