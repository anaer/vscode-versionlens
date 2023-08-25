import { IExpiryCache } from 'domain/caching';
import { UrlHelpers } from 'domain/clients';
import { ILogger } from 'domain/logging';
import {
  createPackageResource,
  PackageDependency,
  TPackageVersionDescriptor
} from 'domain/packages';
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
    suggestionCache: IExpiryCache,
    logger: ILogger
  ) {
    super(nugetClient, suggestionCache, logger);
    this.config = nugetClient.config;
    this.dotnetClient = dotnetCli;
    this.nugetResClient = nugetResClient;
    this.suggestionReplaceFn = defaultReplaceFn
  }

  config: DotNetConfig;

  dotnetClient: DotNetCli;

  nugetResClient: NuGetResourceClient;

  suggestionReplaceFn: TSuggestionReplaceFunction;

  parseDependencies(
    packagePath: string,
    packageText: string
  ): Array<PackageDependency> {

    const packageLocations = createDependenciesFromXml(
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
          );
        }
      );

    return packageDependencies;
  }

  protected async preFetchSuggestions(
    projectPath: string,
    packagePath: string
  ): Promise<NuGetClientData> {
    // ensure latest nuget sources from settings
    this.config.nuget.defrost();

    // get each service index source from the dotnet cli
    const sources = await this.dotnetClient.fetchSources(packagePath)

    // filter remote sources only
    const remoteSources = sources.filter(
      s => s.protocol === UrlHelpers.RegistryProtocols.https ||
        s.protocol === UrlHelpers.RegistryProtocols.http
    );

    // convert each fetch resource to a promise
    const promised = remoteSources.map(
      remoteSource => this.nugetResClient.fetchResource(remoteSource)
    );

    // filter service urls
    const serviceUrls = (await Promise.all(promised))
      .filter(url => url.length > 0);

    if (serviceUrls.length === 0) {
      this.logger.error("Could not resolve any nuget service urls")
      return null;
    }

    return { serviceUrls };
  };

}