import { CachingOptions, HttpOptions } from "domain/clients";
import { IServiceCollection } from "domain/di";
import { DomainService } from "domain/services/eDomainService";
import { createJsonClient } from 'infrastructure/http';
import { createProcessClient } from 'infrastructure/process';
import { DotNetCli } from '../clients/dotnetCli';
import { NuGetPackageClient } from '../clients/nugetPackageClient';
import { NuGetResourceClient } from '../clients/nugetResourceClient';
import { DotNetContributions } from "../definitions/eDotNetContributions";
import { DotNetConfig } from '../dotnetConfig';
import { DotNetSuggestionProvider } from '../dotnetSuggestionProvider';
import { NugetOptions } from "../options/nugetOptions";
import { DotNetService } from "./eDotNetService";

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    DotNetService.dotnetCachingOpts,
    appConfig => new CachingOptions(
      appConfig,
      DotNetContributions.Caching,
      'caching'
    )
  );
}

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    DotNetService.dotnetHttpOpts,
    appConfig => new HttpOptions(
      appConfig,
      DotNetContributions.Http,
      'http'
    )
  );
}

export function addNugetOptions(services: IServiceCollection) {
  services.addSingleton(
    DotNetService.nugetOpts,
    appConfig => new NugetOptions(
      appConfig,
      DotNetContributions.Nuget
    )
  );
}

export function addDotNetConfig(services: IServiceCollection) {
  services.addSingleton(
    DotNetService.dotnetConfig,
    (appConfig, dotnetCachingOpts, dotnetHttpOpts, nugetOpts) =>
      new DotNetConfig(
        appConfig,
        dotnetCachingOpts,
        dotnetHttpOpts,
        nugetOpts
      )
  );
}

export function addProcessClient(services: IServiceCollection) {
  services.addSingleton(
    DotNetService.dotnetProcess,
    (dotnetCachingOpts, logger) =>
      createProcessClient(
        dotnetCachingOpts,
        logger.child({ namespace: 'dotnet process' })
      )
  );
}

export function addCliClient(services: IServiceCollection) {
  services.addSingleton(
    DotNetService.dotnetCli,
    (dotnetConfig, dotnetProcess, logger) =>
      new DotNetCli(
        dotnetConfig,
        dotnetProcess,
        logger.child({ namespace: 'dotnet cli' })
      )
  );
}

export function addJsonClient(services: IServiceCollection) {
  services.addSingleton(
    DotNetService.dotnetJsonClient,
    (dotnetCachingOpts, dotnetHttpOpts, logger) =>
      createJsonClient(
        {
          caching: dotnetCachingOpts,
          http: dotnetHttpOpts
        },
        logger.child({ namespace: 'dotnet request' })
      )
  );
}

export function addNuGetPackageClient(services: IServiceCollection) {
  services.addSingleton(
    DotNetService.nugetClient,
    (dotnetConfig, dotnetJsonClient, logger) =>
      new NuGetPackageClient(
        dotnetConfig,
        dotnetJsonClient,
        logger.child({ namespace: 'dotnet client' })
      )
  );
}

export function addNuGetResourceClient(services: IServiceCollection) {
  services.addSingleton(
    DotNetService.nugetResClient,
    (dotnetJsonClient, logger) =>
      new NuGetResourceClient(
        dotnetJsonClient,
        logger.child({ namespace: 'dotnet resource service' })
      )
  );
}

export function addSuggestionProvider(services: IServiceCollection) {
  services.addSingleton(
    `dotnet${DomainService.suggestionProvider}`,
    (dotnetCli, nugetClient, nugetResClient, logger) =>
      new DotNetSuggestionProvider(
        dotnetCli,
        nugetClient,
        nugetResClient,
        logger.child({ namespace: 'dotnet provider' })
      )
  );
}