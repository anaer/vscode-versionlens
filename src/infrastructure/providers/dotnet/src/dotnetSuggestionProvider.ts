import { UrlHelpers } from 'domain/clients';
import { ILogger } from 'domain/logging';
import { PackageDependency, PackageResponse } from 'domain/packages';
import { AbstractSuggestionProvider } from 'domain/providers';
import {
  defaultReplaceFn,
  ISuggestionProvider,
  TSuggestionReplaceFunction
} from 'domain/suggestions';
import { DotNetCli } from './clients/dotnetCli';
import { NuGetPackageClient } from './clients/nugetPackageClient';
import { NuGetResourceClient } from './clients/nugetResourceClient';
import { NuGetClientData } from './definitions/nuget';
import { DotNetConfig } from './dotnetConfig';
import { createDependenciesFromXml } from './dotnetXmlParserFactory';

export class DotNetSuggestionProvider
  extends AbstractSuggestionProvider<DotNetConfig>
  implements ISuggestionProvider {

  dotnetClient: DotNetCli;

  nugetPackageClient: NuGetPackageClient;

  nugetResClient: NuGetResourceClient;

  suggestionReplaceFn: TSuggestionReplaceFunction;

  constructor(
    dotnetCli: DotNetCli,
    nugetClient: NuGetPackageClient,
    nugetResClient: NuGetResourceClient,
    logger: ILogger
  ) {
    super(nugetClient.config, logger);

    this.dotnetClient = dotnetCli;
    this.nugetPackageClient = nugetClient;
    this.nugetResClient = nugetResClient;
    this.suggestionReplaceFn = defaultReplaceFn
  }

  clearCache() {
    this.dotnetClient.processClient.clearCache();
    this.nugetPackageClient.jsonClient.clearCache();
  }

  parseDependencies(
    packagePath: string,
    packageText: string
  ): Array<PackageDependency> {
    const packageDependencies = createDependenciesFromXml(
      packagePath,
      packageText,
      this.config.dependencyProperties
    );

    return packageDependencies;
  }

  async fetchSuggestions(
    packagePath: string,
    packageDependencies: Array<PackageDependency>
  ): Promise<Array<PackageResponse>> {

    // ensure latest nuget sources from settings
    this.config.nuget.defrost();

    // get each service index source from the dotnet cli
    const sources = await this.dotnetClient.fetchSources(packagePath)

    // remote sources only
    const remoteSources = sources.filter(
      s => s.protocol === UrlHelpers.RegistryProtocols.https ||
        s.protocol === UrlHelpers.RegistryProtocols.http
    );

    // resolve each service url
    const promised = remoteSources.map(
      async (remoteSource) => {
        return await this.nugetResClient.fetchResource(remoteSource);
      }
    );

    const serviceUrls = (await Promise.all(promised))
      .filter(url => url.length > 0);

    if (serviceUrls.length === 0) {
      this.logger.error("Could not resolve any nuget service urls")
      return null;
    }

    const clientData: NuGetClientData = { serviceUrls: serviceUrls }

    return this.fetchPackages(
      this.nugetPackageClient,
      clientData,
      packageDependencies,
    );

  }

}