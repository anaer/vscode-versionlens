import { CachingOptions } from "domain/caching";
import { HttpOptions } from "domain/clients";
import { IServiceCollection } from "domain/di";
import { IDomainServices, IProviderServices } from "domain/services";
import { nameOf } from "domain/utils";
import { createHttpClient } from 'infrastructure/http';
import { createProcessClient } from 'infrastructure/process';
import { MavenClient } from '../clients/mavenClient';
import { MvnCli } from '../clients/mvnCli';
import { MavenContributions } from '../definitions/eMavenContributions';
import { MavenConfig } from '../mavenConfig';
import { MavenSuggestionProvider } from '../mavenSuggestionProvider';
import { IMavenServices } from "./iMavenServices";

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IMavenServices>().mavenCachingOpts,
    (container: IDomainServices) =>
      new CachingOptions(
        container.appConfig,
        MavenContributions.Caching,
        'caching'
      )
  );
}

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IMavenServices>().mavenHttpOpts,
    (container: IDomainServices) =>
      new HttpOptions(
        container.appConfig,
        MavenContributions.Http,
        'http'
      )
  );
}

export function addMavenConfig(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IMavenServices>().mavenConfig,
    (container: IMavenServices & IDomainServices) =>
      new MavenConfig(
        container.appConfig,
        container.mavenCachingOpts,
        container.mavenHttpOpts
      )
  );
}

export function addProcessClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IMavenServices>().mvnProcess,
    (container: IMavenServices & IDomainServices) =>
      createProcessClient(
        container.processesCache,
        container.mavenCachingOpts,
        container.logger.child({ namespace: 'maven mvn process' })
      )
  );
}

export function addCliClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IMavenServices>().mvnCli,
    (container: IMavenServices & IDomainServices) =>
      new MvnCli(
        container.mavenConfig,
        container.mvnProcess,
        container.logger.child({ namespace: 'maven mvn cli' })
      )
  );
}

export function addHttpClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IMavenServices>().mavenHttpClient,
    (container: IMavenServices & IDomainServices) =>
      createHttpClient(
        {
          caching: container.mavenCachingOpts,
          http: container.mavenHttpOpts
        },
        container.logger.child({ namespace: 'maven request' })
      )
  );
}

export function addMavenClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IMavenServices>().mavenClient,
    (container: IMavenServices & IDomainServices) =>
      new MavenClient(
        container.mavenConfig,
        container.mavenHttpClient,
        container.logger.child({ namespace: 'maven client' })
      )
  );
}

export function addSuggestionProvider(services: IServiceCollection) {
  services.addScoped(
    nameOf<IProviderServices>().suggestionProvider,
    (container: IMavenServices & IDomainServices) =>
      new MavenSuggestionProvider(
        container.mvnCli,
        container.mavenClient,
        container.suggestionCache,
        container.logger.child({ namespace: 'maven provider' })
      )
  );
}