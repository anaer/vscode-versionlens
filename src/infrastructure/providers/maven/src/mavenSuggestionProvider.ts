import { throwUndefinedOrNull } from '@esm-test/guards';
import { UrlHelpers } from 'domain/clients';
import { ILogger } from 'domain/logging';
import {
  createPackageResource,
  PackageDependency,
  PackageDescriptorType,
  TPackageNameDescriptor,
  TPackageVersionDescriptor
} from 'domain/packages';
import { ISuggestionProvider } from 'domain/suggestions';
import { MavenClient } from './clients/mavenClient';
import { MvnCli } from './clients/mvnCli';
import { MavenClientData } from './definitions/mavenClientData';
import { MavenConfig } from './mavenConfig';
import { createDependenciesFromXml } from './parser/mavenParser';

export class MavenSuggestionProvider implements ISuggestionProvider {

  readonly name: string = 'maven';

  constructor(
    readonly client: MavenClient,
    readonly mvnCli: MvnCli,
    readonly config: MavenConfig,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("client", client);
    throwUndefinedOrNull("mvnCli", mvnCli);
    throwUndefinedOrNull("config", config);
    throwUndefinedOrNull("logger", logger);
  }

  parseDependencies(
    packagePath: string,
    packageText: string
  ): Array<PackageDependency> {
    const packageLocations = createDependenciesFromXml(
      packageText,
      this.config.dependencyProperties
    );

    const packageDependencies = packageLocations
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

  async preFetchSuggestions(
    projectPath: string,
    packagePath: string
  ): Promise<MavenClientData> {
    // gets source feeds from the project path
    const repos = await this.mvnCli.fetchRepositories(packagePath);

    // filter https urls
    const repositories = repos.filter(
      repo => repo.protocol === UrlHelpers.RegistryProtocols.https
    );

    // return the client data
    return { repositories };
  }

}