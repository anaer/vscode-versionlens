import { throwUndefinedOrNull } from '@esm-test/guards';
import { UrlUtils } from 'domain/clients';
import { ILogger } from 'domain/logging';
import {
  PackageDependency,
  PackageDescriptorType,
  TPackageNameDescriptor,
  TPackageVersionDescriptor,
  TSuggestionReplaceFunction,
  createPackageResource
} from 'domain/packages';
import { ISuggestionProvider } from 'domain/providers';
import { DotNetCli } from './clients/dotnetCli';
import { NuGetPackageClient } from './clients/nugetPackageClient';
import { NuGetResourceClient } from './clients/nugetResourceClient';
import { NuGetClientData } from './definitions/nuget';
import { DotNetConfig } from './dotnetConfig';
import { parseDotNetPackagesXml } from './parser/dotnetParser';
import { dotnetReplaceVersion } from './utils/dotnetReplaceVersion';

export class DotNetSuggestionProvider implements ISuggestionProvider {

  readonly name: string = 'dotnet';

  constructor(
    readonly client: NuGetPackageClient,
    readonly dotnetClient: DotNetCli,
    readonly nugetResClient: NuGetResourceClient,
    readonly config: DotNetConfig,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("client", client);
    throwUndefinedOrNull("dotnetClient", dotnetClient);
    throwUndefinedOrNull("nugetResClient", nugetResClient);
    throwUndefinedOrNull("config", config);
    throwUndefinedOrNull("logger", logger);
  }

  suggestionReplaceFn?: TSuggestionReplaceFunction = dotnetReplaceVersion;

  parseDependencies(packagePath: string, packageText: string): Array<PackageDependency> {

    const parsedPackages = parseDotNetPackagesXml(
      packageText,
      this.config.dependencyProperties
    );

    const packageDependencies = parsedPackages
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
          );
        }
      );

    return packageDependencies;
  }

  async preFetchSuggestions(
    projectPath: string,
    packagePath: string
  ): Promise<NuGetClientData> {
    // ensure latest nuget sources from settings
    this.config.nuget.defrost();

    // get each service index source from the dotnet cli
    const sources = await this.dotnetClient.fetchSources(packagePath)

    // filter remote sources only
    const remoteSources = sources.filter(
      s => s.protocol === UrlUtils.RegistryProtocols.https ||
        s.protocol === UrlUtils.RegistryProtocols.http
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