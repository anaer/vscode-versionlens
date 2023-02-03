import { fetchPackages } from 'application/packages';
import { UrlHelpers } from 'domain/clients';
import { ILogger } from 'domain/logging';
import { PackageDependency, PackageResponse } from 'domain/packages';
import { ISuggestionProvider, TSuggestionReplaceFunction } from 'domain/suggestions';
import { MavenClient } from './clients/mavenClient';
import { MvnCli } from './clients/mvnCli';
import { MavenClientData } from './definitions/mavenClientData';
import { MavenConfig } from './mavenConfig';
import * as MavenXmlFactory from './mavenXmlParserFactory';

export class MavenSuggestionProvider implements ISuggestionProvider {

  mvnCli: MvnCli;

  config: MavenConfig;

  client: MavenClient;

  logger: ILogger;

  suggestionReplaceFn: TSuggestionReplaceFunction;

  constructor(mnvCli: MvnCli, client: MavenClient, logger: ILogger) {
    this.mvnCli = mnvCli;
    this.client = client;
    this.config = client.config;
    this.logger = logger;
  }

  parseDependencies(packageText: string): Array<PackageDependency> {
    const packageDependencies = MavenXmlFactory.createDependenciesFromXml(
      packageText,
      this.config.dependencyProperties
    );

    return packageDependencies;
  }

  async fetchSuggestions(
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

      return fetchPackages(
        packagePath,
        this.client,
        clientData,
        packageDependencies
      );
    })

  }

}