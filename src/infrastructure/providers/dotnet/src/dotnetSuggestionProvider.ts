import { throwUndefinedOrNull } from '@esm-test/guards';
import { UrlHelpers } from 'domain/clients';
import { ILogger } from 'domain/logging';
import {
  PackageDependency,
  PackageDescriptorType,
  TPackageNameDescriptor,
  TPackageVersionDescriptor,
  createPackageResource
} from 'domain/packages';
import { ISuggestionProvider, TSuggestionReplaceFunction } from 'domain/suggestions';
import { DotNetCli } from './clients/dotnetCli';
import { NuGetPackageClient } from './clients/nugetPackageClient';
import { NuGetResourceClient } from './clients/nugetResourceClient';
import { NuGetClientData } from './definitions/nuget';
import { DotNetConfig } from './dotnetConfig';
import { createDependenciesFromXml } from './parser/dotnetParser';
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

    const packageDescriptors = createDependenciesFromXml(
      packageText,
      this.config.dependencyProperties
    );

    const packageDependencies = packageDescriptors
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