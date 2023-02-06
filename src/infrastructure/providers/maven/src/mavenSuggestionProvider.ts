import { UrlHelpers } from 'domain/clients';
import { ILogger } from 'domain/logging';
import { PackageDependency } from 'domain/packages';
import { AbstractSuggestionProvider } from 'domain/providers';
import { ISuggestionProvider, TSuggestionReplaceFunction } from 'domain/suggestions';
import { MavenClient } from './clients/mavenClient';
import { MvnCli } from './clients/mvnCli';
import { MavenClientData } from './definitions/mavenClientData';
import { MavenConfig } from './mavenConfig';
import * as MavenXmlFactory from './mavenXmlParserFactory';

export class MavenSuggestionProvider
  extends AbstractSuggestionProvider<MavenConfig, MavenClient, MavenClientData>
  implements ISuggestionProvider {

  mvnCli: MvnCli;

  suggestionReplaceFn: TSuggestionReplaceFunction;

  constructor(mnvCli: MvnCli, client: MavenClient, logger: ILogger) {
    super(client.config, client, logger);
    this.mvnCli = mnvCli;
  }

  clearCache() {
    this.client.httpClient.clearCache();
  }

  parseDependencies(
    packagePath: string,
    packageText: string
  ): Array<PackageDependency> {
    const packageDependencies = MavenXmlFactory.createDependenciesFromXml(
      packagePath,
      packageText,
      this.config.dependencyProperties
    );

    return packageDependencies;
  }

  protected async preFetchSuggestions(packagePath: string): Promise<MavenClientData> {
    // gets source feeds from the project path
    const repos = await this.mvnCli.fetchRepositories(packagePath);

    // filter https urls
    const repositories = repos.filter(
      repo => repo.protocol === UrlHelpers.RegistryProtocols.https
    );

    // return the client data
    return { repositories } as MavenClientData;
  }

}