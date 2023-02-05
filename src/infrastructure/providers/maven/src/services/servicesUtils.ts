import { CachingOptions, HttpOptions } from "domain/clients";
import { IServiceCollection } from "domain/di";
import { DomainService } from "domain/services/eDomainService";
import { createHttpClient } from 'infrastructure/http';
import { createProcessClient } from 'infrastructure/process';
import { MavenClient } from '../clients/mavenClient';
import { MvnCli } from '../clients/mvnCli';
import { MavenContributions } from '../definitions/eMavenContributions';
import { MavenConfig } from '../mavenConfig';
import { MavenSuggestionProvider } from '../mavenSuggestionProvider';
import { MavenService } from "./eMavenService";

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    MavenService.mavenCachingOpts,
    appConfig => new CachingOptions(
      appConfig,
      MavenContributions.Caching,
      'caching'
    )
  );
}

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    MavenService.mavenHttpOpts,
    appConfig => new HttpOptions(
      appConfig,
      MavenContributions.Http,
      'http'
    )
  );
}

export function addMavenConfig(services: IServiceCollection) {
  services.addSingleton(
    MavenService.mavenConfig,
    (appConfig, mavenCachingOpts, mavenHttpOpts) =>
      new MavenConfig(
        appConfig,
        mavenCachingOpts,
        mavenHttpOpts
      )
  );
}

export function addProcessClient(services: IServiceCollection) {
  services.addSingleton(
    MavenService.mvnProcess,
    (mavenCachingOpts, logger) =>
      createProcessClient(
        mavenCachingOpts,
        logger.child({ namespace: 'maven mvn process' })
      )
  );
}

export function addCliClient(services: IServiceCollection) {
  services.addSingleton(
    MavenService.mvnCli,
    (mavenConfig, mvnProcess, logger) =>
      new MvnCli(
        mavenConfig,
        mvnProcess,
        logger.child({ namespace: 'maven mvn cli' })
      )
  );
}

export function addHttpClient(services: IServiceCollection) {
  services.addSingleton(
    MavenService.mavenHttpClient,
    (mavenCachingOpts, mavenHttpOpts, logger) =>
      createHttpClient(
        {
          caching: mavenCachingOpts,
          http: mavenHttpOpts
        },
        logger.child({ namespace: 'maven request' })
      )
  );
}

export function addMavenClient(services: IServiceCollection) {
  services.addSingleton(
    MavenService.mavenClient,
    (mavenConfig, mavenHttpClient, logger) =>
      new MavenClient(
        mavenConfig,
        mavenHttpClient,
        logger.child({ namespace: 'maven client' })
      )
  );
}

export function addSuggestionProvider(services: IServiceCollection) {
  services.addSingleton(
    `maven${DomainService.suggestionProvider}`,
    (mvnCli, mavenClient, logger) =>
      new MavenSuggestionProvider(
        mvnCli,
        mavenClient,
        logger.child({ namespace: 'maven provider' })
      )
  );
}