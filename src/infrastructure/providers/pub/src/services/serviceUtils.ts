import { CachingOptions } from "domain/caching";
import { IServiceCollection } from "domain/di";
import { HttpOptions } from "domain/http";
import { IDomainServices, IProviderServices } from "domain/services";
import { nameOf } from "domain/utils";
import { createJsonClient } from "infrastructure/http";
import { PubContributions } from "../definitions/ePubContributions";
import { PubClient } from "../pubClient";
import { PubConfig } from "../pubConfig";
import { PubSuggestionProvider } from "../pubSuggestionProvider";
import { IPubServices } from "./iPubServices";

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IPubServices>().pubCachingOpts,
    (container: IDomainServices) =>
      new CachingOptions(
        container.appConfig,
        PubContributions.Caching,
        'caching'
      )
  );
}

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IPubServices>().pubHttpOpts,
    (container: IDomainServices) =>
      new HttpOptions(
        container.appConfig,
        PubContributions.Http,
        'http'
      )
  );
}

export function addPubConfig(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IPubServices>().pubConfig,
    (container: IPubServices & IDomainServices) =>
      new PubConfig(
        container.appConfig,
        container.pubCachingOpts,
        container.pubHttpOpts
      )
  );
}

export function addJsonClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IPubServices>().pubJsonClient,
    (container: IPubServices & IDomainServices) =>
      createJsonClient(
        {
          caching: container.pubCachingOpts,
          http: container.pubHttpOpts
        },
        container.logger.child({ namespace: 'pub request' })
      )
  );
}

export function addPubClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IPubServices>().pubClient,
    (container: IPubServices & IDomainServices) =>
      new PubClient(
        container.pubConfig,
        container.pubJsonClient,
        container.logger.child({ namespace: 'pub client' })
      )
  );
}

export function addSuggestionProvider(services: IServiceCollection) {
  services.addScoped(
    nameOf<IProviderServices>().suggestionProvider,
    (container: IPubServices & IDomainServices) =>
      new PubSuggestionProvider(
        container.pubClient,
        container.suggestionCache,
        container.logger.child({ namespace: 'pub provider' })
      )
  );
}