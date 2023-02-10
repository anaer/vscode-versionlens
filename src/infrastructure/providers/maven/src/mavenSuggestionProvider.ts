import { UrlHelpers } from 'domain/clients';
import { ILogger } from 'domain/logging';
import {
  createPackageResource,
  PackageDependency,
  TPackageVersionLocationDescriptor
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

  constructor(mnvCli: MvnCli, client: MavenClient, logger: ILogger) {
    super(client, logger);
    this.config = client.config;
    this.mvnCli = mnvCli;
  }

  config: MavenConfig

  mvnCli: MvnCli;

  suggestionReplaceFn: TSuggestionReplaceFunction;

  clearCache() {
    this.client.httpClient.clearCache();
  }

  parseDependencies(
    packagePath: string,
    packageText: string
  ): Array<PackageDependency> {
    const packageLocations = MavenXmlFactory.createDependenciesFromXml(

      packageText,
      this.config.dependencyProperties
    );

    const packageDependencies = packageLocations
      .filter(x => x.types[0].type === "version")
      .map(
        loc => {
          const versionType = loc.types[0] as TPackageVersionLocationDescriptor
          return new PackageDependency(
            createPackageResource(
              loc.name,
              versionType.version,
              packagePath
            ),
            loc.nameRange,
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