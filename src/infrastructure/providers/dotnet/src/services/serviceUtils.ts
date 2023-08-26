import { CachingOptions } from "domain/caching";
import { HttpOptions } from "domain/clients";
import { IServiceCollection } from "domain/di";
import { IDomainServices, IProviderServices } from "domain/services";
import { nameOf } from "domain/utils";
import { createJsonClient } from 'infrastructure/http';
import { createProcessClient } from 'infrastructure/process';
import { DotNetCli } from '../clients/dotnetCli';
import { NuGetPackageClient } from '../clients/nugetPackageClient';
import { NuGetResourceClient } from '../clients/nugetResourceClient';
import { DotNetContributions } from "../definitions/eDotNetContributions";
import { DotNetConfig } from '../dotnetConfig';
import { DotNetSuggestionProvider } from '../dotnetSuggestionProvider';
import { NugetOptions } from "../options/nugetOptions";
import { IDotNetServices } from "./iDotnetServices";

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDotNetServices>().dotnetCachingOpts,
    (container: IDomainServices) =>
      new CachingOptions(
        container.appConfig,
        DotNetContributions.Caching,
        'caching'
      )
  );
}

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDotNetServices>().dotnetHttpOpts,
    (container: IDomainServices) =>
      new HttpOptions(
        container.appConfig,
        DotNetContributions.Http,
        'http'
      )
  );
}

export function addNugetOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDotNetServices>().nugetOpts,
    (container: IDomainServices) =>
      new NugetOptions(
        container.appConfig,
        DotNetContributions.Nuget
      )
  );
}

export function addDotNetConfig(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDotNetServices>().dotnetConfig,
    (container: IDotNetServices & IDomainServices) =>
      new DotNetConfig(
        container.appConfig,
        container.dotnetCachingOpts,
        container.dotnetHttpOpts,
        container.nugetOpts
      )
  );
}

export function addProcessClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDotNetServices>().dotnetProcess,
    (container: IDotNetServices & IDomainServices) =>
      createProcessClient(
        container.processesCache,
        container.dotnetCachingOpts,
        container.logger.child({ namespace: 'process client' })
      )
  );
}

export function addCliClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDotNetServices>().dotnetCli,
    (container: IDotNetServices & IDomainServices) =>
      new DotNetCli(
        container.dotnetConfig,
        container.dotnetProcess,
        container.logger.child({ namespace: 'dotnet cli' })
      )
  );
}

export function addJsonClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDotNetServices>().dotnetJsonClient,
    (container: IDotNetServices & IDomainServices) =>
      createJsonClient(
        {
          caching: container.dotnetCachingOpts,
          http: container.dotnetHttpOpts
        },
        container.logger.child({ namespace: 'dotnet request' })
      )
  );
}

export function addNuGetPackageClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDotNetServices>().nugetClient,
    (container: IDotNetServices & IDomainServices) =>
      new NuGetPackageClient(
        container.dotnetConfig,
        container.dotnetJsonClient,
        container.logger.child({ namespace: 'dotnet client' })
      )
  );
}

export function addNuGetResourceClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDotNetServices>().nugetResClient,
    (container: IDotNetServices & IDomainServices) =>
      new NuGetResourceClient(
        container.dotnetJsonClient,
        container.logger.child({ namespace: 'dotnet resource service' })
      )
  );
}

export function addSuggestionProvider(services: IServiceCollection) {
  services.addScoped(
    nameOf<IProviderServices>().suggestionProvider,
    (container: IDotNetServices & IDomainServices) =>
      new DotNetSuggestionProvider(
        container.dotnetCli,
        container.nugetClient,
        container.nugetResClient,
        container.suggestionCache,
        container.logger.child({ namespace: 'dotnet provider' })
      )
  );
}