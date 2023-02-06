import { UrlHelpers } from 'domain/clients';
import { ILogger } from 'domain/logging';
import { PackageDependency } from 'domain/packages';
import { SuggestionProvider } from 'domain/providers';
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
  extends SuggestionProvider<NuGetPackageClient, NuGetClientData>
  implements ISuggestionProvider {

  constructor(
    dotnetCli: DotNetCli,
    nugetClient: NuGetPackageClient,
    nugetResClient: NuGetResourceClient,
    logger: ILogger
  ) {
    super(nugetClient, logger);
    this.config = nugetClient.config;
    this.dotnetClient = dotnetCli;
    this.nugetResClient = nugetResClient;
    this.suggestionReplaceFn = defaultReplaceFn
  }

  config: DotNetConfig;

  dotnetClient: DotNetCli;

  nugetResClient: NuGetResourceClient;

  suggestionReplaceFn: TSuggestionReplaceFunction;

  clearCache() {
    this.dotnetClient.processClient.clearCache();
    this.client.jsonClient.clearCache();
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

  protected async preFetchSuggestions(packagePath: string) {
    // ensure latest nuget sources from settings
    this.config.nuget.defrost();

    // get each service index source from the dotnet cli
    const sources = await this.dotnetClient.fetchSources(packagePath)

    // filter remote sources only
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

    // filter service urls
    const serviceUrls = (await Promise.all(promised))
      .filter(url => url.length > 0);

    if (serviceUrls.length === 0) {
      this.logger.error("Could not resolve any nuget service urls")
      return null;
    }

    return { serviceUrls } as NuGetClientData
  };

}