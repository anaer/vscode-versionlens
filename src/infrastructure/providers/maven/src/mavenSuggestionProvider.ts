import { UrlHelpers } from 'domain/clients';
import { ILogger } from 'domain/logging';
import { PackageDependency, PackageResponse } from 'domain/packages';
import { AbstractSuggestionProvider } from 'domain/providers';
import { ISuggestionProvider, TSuggestionReplaceFunction } from 'domain/suggestions';
import { MavenClient } from './clients/mavenClient';
import { MvnCli } from './clients/mvnCli';
import { MavenClientData } from './definitions/mavenClientData';
import { MavenConfig } from './mavenConfig';
import * as MavenXmlFactory from './mavenXmlParserFactory';

export class MavenSuggestionProvider
  extends AbstractSuggestionProvider<MavenConfig>
  implements ISuggestionProvider {

  mvnCli: MvnCli;

  client: MavenClient;

  suggestionReplaceFn: TSuggestionReplaceFunction;

  constructor(mnvCli: MvnCli, client: MavenClient, logger: ILogger) {
    super(client.config, logger);
    this.mvnCli = mnvCli;
    this.client = client;
  }

  clearCache() {
    // @ts-ignore
    this.client.httpClient.cache.clear();
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

  fetchSuggestions(
    packagePath: string,
    packageDependencies: Array<PackageDependency>
  ): Promise<Array<PackageResponse>> {

    // gets source feeds from the project path
    const promisedRepos = this.mvnCli.fetchRepositories(packagePath);

    return promisedRepos.then(repos => {

      const repositories = repos.filter(
        repo => repo.protocol === UrlHelpers.RegistryProtocols.https
      );

      const clientData: MavenClientData = { repositories }

      return this.fetchPackages(
        this.client,
        clientData,
        packageDependencies
      );
    })

  }

}