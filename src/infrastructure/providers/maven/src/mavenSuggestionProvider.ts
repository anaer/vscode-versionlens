import { UrlHelpers } from 'domain/clients';
import { ILogger } from 'domain/logging';
import {
  createPackageResource,
  PackageCache,
  PackageDependency,
  PackageDescriptorType,
  TPackageNameDescriptor,
  TPackageVersionDescriptor
} from 'domain/packages';
import {
  ISuggestionProvider,
  SuggestionProvider,
  TSuggestionReplaceFunction
} from 'domain/suggestions';
import { MavenClient } from './clients/mavenClient';
import { MvnCli } from './clients/mvnCli';
import { MavenClientData } from './definitions/mavenClientData';
import { MavenConfig } from './mavenConfig';
import * as MavenXmlFactory from './mavenXmlParserFactory';

export class MavenSuggestionProvider
  extends SuggestionProvider<MavenClientData>
  implements ISuggestionProvider {

  constructor(
    mnvCli: MvnCli,
    client: MavenClient,
    packageCache: PackageCache,
    logger: ILogger
  ) {
    super(client, packageCache, logger);
    this.config = client.config;
    this.mvnCli = mnvCli;
  }

  config: MavenConfig

  mvnCli: MvnCli;

  suggestionReplaceFn: TSuggestionReplaceFunction;

  parseDependencies(
    packagePath: string,
    packageText: string
  ): Array<PackageDependency> {
    const packageLocations = MavenXmlFactory.createDependenciesFromXml(

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

  protected async preFetchSuggestions(
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