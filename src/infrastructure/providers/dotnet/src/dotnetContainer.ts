import { asFunction, AwilixContainer } from 'awilix';
import { CachingOptions, HttpOptions } from 'domain/clients';
import { ISuggestionProvider } from 'domain/suggestions';
import { createJsonClient } from 'infrastructure/http';
import { createProcessClient } from 'infrastructure/process';
import { DotNetCli } from './clients/dotnetCli';
import { NuGetPackageClient } from './clients/nugetPackageClient';
import { NuGetResourceClient } from './clients/nugetResourceClient';
import { DotNetContributions } from './definitions/eDotNetContributions';
import { IDotNetServices } from './definitions/iDotNetServices';
import { DotNetConfig } from './dotnetConfig';
import { DotNetSuggestionProvider } from './dotnetSuggestionProvider';
import { NugetOptions } from './options/nugetOptions';

export function configureContainer(
  container: AwilixContainer<IDotNetServices>
): ISuggestionProvider {

  const services = {

    // options
    nugetOpts: asFunction(
      appConfig => new NugetOptions(
        appConfig,
        DotNetContributions.Nuget
      )
    ).singleton(),

    dotnetCachingOpts: asFunction(
      appConfig => new CachingOptions(
        appConfig,
        DotNetContributions.Caching,
        'caching'
      )
    ).singleton(),

    dotnetHttpOpts: asFunction(
      appConfig => new HttpOptions(
        appConfig,
        DotNetContributions.Http,
        'http'
      )
    ).singleton(),

    // config
    dotnetConfig: asFunction(
      (appConfig, dotnetCachingOpts, dotnetHttpOpts, nugetOpts) =>
        new DotNetConfig(
          appConfig,
          dotnetCachingOpts,
          dotnetHttpOpts,
          nugetOpts
        )
    ).singleton(),

    // cli
    dotnetProcess: asFunction(
      (dotnetCachingOpts, logger) =>
        createProcessClient(
          dotnetCachingOpts,
          logger.child({ namespace: 'dotnet process' })
        )
    ).singleton(),

    dotnetCli: asFunction(
      (dotnetConfig, dotnetProcess, logger) =>
        new DotNetCli(
          dotnetConfig,
          dotnetProcess,
          logger.child({ namespace: 'dotnet cli' })
        )
    ).singleton(),

    // clients
    dotnetJsonClient: asFunction(
      (dotnetCachingOpts, dotnetHttpOpts, logger) =>
        createJsonClient(
          {
            caching: dotnetCachingOpts,
            http: dotnetHttpOpts
          },
          logger.child({ namespace: 'dotnet request' })
        )
    ).singleton(),

    nugetClient: asFunction(
      (dotnetConfig, dotnetJsonClient, logger) =>
        new NuGetPackageClient(
          dotnetConfig,
          dotnetJsonClient,
          logger.child({ namespace: 'dotnet client' })
        )
    ).singleton(),

    nugetResClient: asFunction(
      (dotnetJsonClient, logger) =>
        new NuGetResourceClient(
          dotnetJsonClient,
          logger.child({ namespace: 'dotnet resource service' })
        )
    ).singleton(),

    // provider
    dotnetProvider: asFunction(
      (dotnetCli, nugetClient, nugetResClient, logger) =>
        new DotNetSuggestionProvider(
          dotnetCli,
          nugetClient,
          nugetResClient,
          logger.child({ namespace: 'dotnet provider' })
        )
    ).singleton(),
  };

  container.register(services);

  return container.cradle.dotnetProvider;
}