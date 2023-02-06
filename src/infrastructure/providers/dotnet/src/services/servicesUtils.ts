import { CachingOptions, HttpOptions } from "domain/clients";
import { IServiceCollection } from "domain/di";
import { DomainService } from "domain/services/domainService";
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
import { DotNetService } from "./dotnetService";

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<DotNetService>().dotnetCachingOpts,
    (container: DomainService) =>
      new CachingOptions(
        container.appConfig,
        DotNetContributions.Caching,
        'caching'
      )
  );
}

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<DotNetService>().dotnetHttpOpts,
    (container: DomainService) =>
      new HttpOptions(
        container.appConfig,
        DotNetContributions.Http,
        'http'
      )
  );
}

export function addNugetOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<DotNetService>().nugetOpts,
    (container: DomainService) =>
      new NugetOptions(
        container.appConfig,
        DotNetContributions.Nuget
      )
  );
}

export function addDotNetConfig(services: IServiceCollection) {
  services.addSingleton(
    nameOf<DotNetService>().dotnetConfig,
    (container: DotNetService & DomainService) =>
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
    nameOf<DotNetService>().dotnetProcess,
    (container: DotNetService & DomainService) =>
      createProcessClient(
        container.dotnetCachingOpts,
        container.logger.child({ namespace: 'dotnet process' })
      )
  );
}

export function addCliClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<DotNetService>().dotnetCli,
    (container: DotNetService & DomainService) =>
      new DotNetCli(
        container.dotnetConfig,
        container.dotnetProcess,
        container.logger.child({ namespace: 'dotnet cli' })
      )
  );
}

export function addJsonClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<DotNetService>().dotnetJsonClient,
    (container: DotNetService & DomainService) =>
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
    nameOf<DotNetService>().nugetClient,
    (container: DotNetService & DomainService) =>
      new NuGetPackageClient(
        container.dotnetConfig,
        container.dotnetJsonClient,
        container.logger.child({ namespace: 'dotnet client' })
      )
  );
}

export function addNuGetResourceClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<DotNetService>().nugetResClient,
    (container: DotNetService & DomainService) =>
      new NuGetResourceClient(
        container.dotnetJsonClient,
        container.logger.child({ namespace: 'dotnet resource service' })
      )
  );
}

export function addSuggestionProvider(services: IServiceCollection) {
  services.addSingleton(
    nameOf<DotNetService>().dotnetSuggestionProvider,
    (container: DotNetService & DomainService) =>
      new DotNetSuggestionProvider(
        container.dotnetCli,
        container.nugetClient,
        container.nugetResClient,
        container.logger.child({ namespace: 'dotnet provider' })
      )
  );
}