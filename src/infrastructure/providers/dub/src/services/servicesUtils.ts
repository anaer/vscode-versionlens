import { CachingOptions, HttpOptions } from "domain/clients";
import { IServiceCollection, ServiceInjectionMode } from "domain/di";
import { DomainService } from "domain/services/domainService";
import { nameOf } from "domain/utils";
import { createJsonClient } from "infrastructure/http";
import { DubContributions } from "../definitions/eDubContributions";
import { IDubServices } from "../definitions/iDubServices";
import { DubClient } from "../dubClient";
import { DubConfig } from "../dubConfig";
import { DubSuggestionProvider } from "../dubSuggestionProvider";
import { DubService } from "./dubService";

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<DubService>().dubCachingOpts,
    (container: DomainService) =>
      new CachingOptions(
        container.appConfig,
        DubContributions.Caching,
        'caching'
      ),
    ServiceInjectionMode.proxy
  );
}

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<DubService>().dubHttpOpts,
    (container: DomainService) =>
      new HttpOptions(
        container.appConfig,
        DubContributions.Http,
        'http'
      ),
    ServiceInjectionMode.proxy
  );
}

export function addDubConfig(services: IServiceCollection) {
  services.addSingleton(
    nameOf<DubService>().dubConfig,
    (container: IDubServices & DomainService) =>
      new DubConfig(
        container.appConfig,
        container.dubCachingOpts,
        container.dubHttpOpts
      ),
    ServiceInjectionMode.proxy
  );
}

export function addJsonClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<DubService>().dubJsonClient,
    (container: IDubServices & DomainService) =>
      createJsonClient(
        {
          caching: container.dubCachingOpts,
          http: container.dubHttpOpts
        },
        container.logger.child({ namespace: 'dub request' })
      ),
    ServiceInjectionMode.proxy
  );
}

export function addDubClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<DubService>().dubClient,
    (container: IDubServices & DomainService) =>
      new DubClient(
        container.dubConfig,
        container.dubJsonClient,
        container.logger.child({ namespace: 'dub client' })
      ),
    ServiceInjectionMode.proxy
  );
}

export function addSuggestionProvider(services: IServiceCollection) {
  services.addSingleton(
    nameOf<DubService>().dubSuggestionProvider,
    (container: IDubServices & DomainService) =>
      new DubSuggestionProvider(
        container.dubClient,
        container.logger.child({ namespace: 'dub provider' })
      ),
    ServiceInjectionMode.proxy
  );
}