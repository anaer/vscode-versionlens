import { IExpiryCache } from 'domain/caching/iExpiryCache';
import { UrlHelpers } from 'domain/clients';
import { ILogger } from 'domain/logging';
import {
  createPackageResource,
  PackageDependency,
  TPackageVersionDescriptor
} from 'domain/packages';
import { SuggestionProvider } from 'domain/providers';
import { ISuggestionProvider, TSuggestionReplaceFunction } from 'domain/suggestions';
import { MavenClient } from './clients/mavenClient';
import { MvnCli } from './clients/mvnCli';
import { MavenClientData } from './definitions/mavenClientData';
import { MavenConfig } from './mavenConfig';
import * as MavenXmlFactory from './mavenXmlParserFactory';

export class MavenSuggestionProvider
  extends SuggestionProvider<MavenClient, MavenClientData>
  implements ISuggestionProvider {

  constructor(
    mnvCli: MvnCli,
    client: MavenClient,
    suggestionCache: IExpiryCache,
    logger: ILogger
  ) {
    super(client, suggestionCache, logger);
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