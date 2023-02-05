import { CachingOptions, HttpOptions } from "domain/clients";
import { IServiceCollection } from "domain/di";
import { DomainService } from "domain/services/eDomainService";
import { createJsonClient } from "infrastructure/http";
import { PubContributions } from "../definitions/ePubContributions";
import { PubClient } from "../pubClient";
import { PubConfig } from "../pubConfig";
import { PubSuggestionProvider } from "../pubSuggestionProvider";
import { PubService } from "./ePubService";

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    PubService.pubCachingOpts,
    appConfig => new CachingOptions(
      appConfig,
      PubContributions.Caching,
      'caching'
    )
  );
}

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    PubService.pubHttpOpts,
    appConfig => new HttpOptions(
      appConfig,
      PubContributions.Http,
      'http'
    )
  );
}

export function addPubConfig(services: IServiceCollection) {
  services.addSingleton(
    PubService.pubConfig,
    (appConfig, pubCachingOpts, pubHttpOpts) =>
      new PubConfig(appConfig, pubCachingOpts, pubHttpOpts)
  );
}

export function addJsonClient(services: IServiceCollection) {
  services.addSingleton(
    PubService.pubJsonClient,
    (pubCachingOpts, pubHttpOpts, logger) =>
      createJsonClient(
        {
          caching: pubCachingOpts,
          http: pubHttpOpts
        },
        logger.child({ namespace: 'pub request' })
      )
  );
}

export function addPubClient(services: IServiceCollection) {
  services.addSingleton(
    PubService.pubClient,
    (pubConfig, pubJsonClient, logger) =>
      new PubClient(
        pubConfig,
        pubJsonClient,
        logger.child({ namespace: 'pub client' })
      )
  );
}

export function addSuggestionProvider(services: IServiceCollection) {
  services.addSingleton(
    `pub${DomainService.suggestionProvider}`,
    (pubClient, logger) =>
      new PubSuggestionProvider(
        pubClient,
        logger.child({ namespace: 'pub provider' })
      )
  );
}