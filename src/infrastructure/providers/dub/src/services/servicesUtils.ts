import { CachingOptions, HttpOptions } from "domain/clients";
import { IServiceCollection } from "domain/di";
import { DomainService } from "domain/services/eDomainService";
import { createJsonClient } from "infrastructure/http";
import { DubContributions } from "../definitions/eDubContributions";
import { DubClient } from "../dubClient";
import { DubConfig } from "../dubConfig";
import { DubSuggestionProvider } from "../dubSuggestionProvider";
import { DubService } from "./eDubService";

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    DubService.dubCachingOpts,
    appConfig => new CachingOptions(
      appConfig,
      DubContributions.Caching,
      'caching'
    )
  );
}

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    DubService.dubHttpOpts,
    appConfig => new HttpOptions(
      appConfig,
      DubContributions.Http,
      'http'
    )
  );
}

export function addDubConfig(services: IServiceCollection) {
  services.addSingleton(
    DubService.dubConfig,
    (appConfig, dubCachingOpts, dubHttpOpts) =>
      new DubConfig(appConfig, dubCachingOpts, dubHttpOpts)
  );
}

export function addJsonClient(services: IServiceCollection) {
  services.addSingleton(
    DubService.dubJsonClient,
    (dubCachingOpts, dubHttpOpts, logger) =>
      createJsonClient(
        {
          caching: dubCachingOpts,
          http: dubHttpOpts
        },
        logger.child({ namespace: 'dub request' })
      )
  );
}

export function addDubClient(services: IServiceCollection) {
  services.addSingleton(
    DubService.dubClient,
    (dubConfig, dubJsonClient, logger) =>
      new DubClient(
        dubConfig,
        dubJsonClient,
        logger.child({ namespace: 'dub client' })
      )
  );
}

export function addSuggestionProvider(services: IServiceCollection) {
  services.addSingleton(
    `dub${DomainService.suggestionProvider}`,
    (dubClient, logger) =>
      new DubSuggestionProvider(
        dubClient,
        logger.child({ namespace: 'dub provider' })
      )
  );
}