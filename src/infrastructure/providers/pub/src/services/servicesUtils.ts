import { CachingOptions, HttpOptions } from "domain/clients";
import { IServiceCollection, ServiceInjectionMode } from "domain/di";
import { DomainService } from "domain/services/domainService";
import { nameOf } from "domain/utils";
import { createJsonClient } from "infrastructure/http";
import { PubContributions } from "../definitions/ePubContributions";
import { PubClient } from "../pubClient";
import { PubConfig } from "../pubConfig";
import { PubSuggestionProvider } from "../pubSuggestionProvider";
import { PubService } from "./ePubService";

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<PubService>().pubCachingOpts,
    (container: DomainService) =>
      new CachingOptions(
        container.appConfig,
        PubContributions.Caching,
        'caching'
      ),
    ServiceInjectionMode.proxy
  );
}

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<PubService>().pubHttpOpts,
    (container: DomainService) =>
      new HttpOptions(
        container.appConfig,
        PubContributions.Http,
        'http'
      ),
    ServiceInjectionMode.proxy
  );
}

export function addPubConfig(services: IServiceCollection) {
  services.addSingleton(
    nameOf<PubService>().pubConfig,
    (container: PubService & DomainService) =>
      new PubConfig(
        container.appConfig,
        container.pubCachingOpts,
        container.pubHttpOpts
      ),
    ServiceInjectionMode.proxy
  );
}

export function addJsonClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<PubService>().pubJsonClient,
    (container: PubService & DomainService) =>
      createJsonClient(
        {
          caching: container.pubCachingOpts,
          http: container.pubHttpOpts
        },
        container.logger.child({ namespace: 'pub request' })
      ),
    ServiceInjectionMode.proxy
  );
}

export function addPubClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<PubService>().pubClient,
    (container: PubService & DomainService) =>
      new PubClient(
        container.pubConfig,
        container.pubJsonClient,
        container.logger.child({ namespace: 'pub client' })
      ),
    ServiceInjectionMode.proxy
  );
}

export function addSuggestionProvider(services: IServiceCollection) {
  services.addSingleton(
    nameOf<PubService>().pubSuggestionProvider,
    (container: PubService & DomainService) =>
      new PubSuggestionProvider(
        container.pubClient,
        container.logger.child({ namespace: 'pub provider' })
      ),
    ServiceInjectionMode.proxy
  );
}