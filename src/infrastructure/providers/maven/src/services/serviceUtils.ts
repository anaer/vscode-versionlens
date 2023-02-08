import { CachingOptions, HttpOptions } from "domain/clients";
import { IServiceCollection } from "domain/di";
import { DomainService } from "domain/services/domainService";
import { nameOf } from "domain/utils";
import { createHttpClient } from 'infrastructure/http';
import { createProcessClient } from 'infrastructure/process';
import { MavenClient } from '../clients/mavenClient';
import { MvnCli } from '../clients/mvnCli';
import { MavenContributions } from '../definitions/eMavenContributions';
import { MavenConfig } from '../mavenConfig';
import { MavenSuggestionProvider } from '../mavenSuggestionProvider';
import { MavenService } from "./mavenService";

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<MavenService>().mavenCachingOpts,
    (container: DomainService) =>
      new CachingOptions(
        container.appConfig,
        MavenContributions.Caching,
        'caching'
      )
  );
}

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<MavenService>().mavenHttpOpts,
    (container: DomainService) =>
      new HttpOptions(
        container.appConfig,
        MavenContributions.Http,
        'http'
      )
  );
}

export function addMavenConfig(services: IServiceCollection) {
  services.addSingleton(
    nameOf<MavenService>().mavenConfig,
    (container: MavenService & DomainService) =>
      new MavenConfig(
        container.appConfig,
        container.mavenCachingOpts,
        container.mavenHttpOpts
      )
  );
}

export function addProcessClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<MavenService>().mvnProcess,
    (container: MavenService & DomainService) =>
      createProcessClient(
        container.mavenCachingOpts,
        container.logger.child({ namespace: 'maven mvn process' })
      )
  );
}

export function addCliClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<MavenService>().mvnCli,
    (container: MavenService & DomainService) =>
      new MvnCli(
        container.mavenConfig,
        container.mvnProcess,
        container.logger.child({ namespace: 'maven mvn cli' })
      )
  );
}

export function addHttpClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<MavenService>().mavenHttpClient,
    (container: MavenService & DomainService) =>
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
    nameOf<MavenService>().mavenClient,
    (container: MavenService & DomainService) =>
      new MavenClient(
        container.mavenConfig,
        container.mavenHttpClient,
        container.logger.child({ namespace: 'maven client' })
      )
  );
}

export function addSuggestionProvider(services: IServiceCollection) {
  services.addScoped(
    nameOf<DomainService>().suggestionProvider,
    (container: MavenService & DomainService) =>
      new MavenSuggestionProvider(
        container.mvnCli,
        container.mavenClient,
        container.logger.child({ namespace: 'maven provider' })
      )
  );
}