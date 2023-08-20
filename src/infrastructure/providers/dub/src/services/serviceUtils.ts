import { CachingOptions, HttpOptions } from "domain/clients";
import { IServiceCollection } from "domain/di";
import { IDomainServices, IProviderServices } from "domain/services";
import { nameOf } from "domain/utils";
import { createJsonClient } from "infrastructure/http";
import { DubContributions } from "../definitions/eDubContributions";
import { IDubServices } from "../definitions/iDubServices";
import { DubClient } from "../dubClient";
import { DubConfig } from "../dubConfig";
import { DubSuggestionProvider } from "../dubSuggestionProvider";

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDubServices>().dubCachingOpts,
    (container: IDomainServices) =>
      new CachingOptions(
        container.appConfig,
        DubContributions.Caching,
        'caching'
      )
  );
}

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDubServices>().dubHttpOpts,
    (container: IDomainServices) =>
      new HttpOptions(
        container.appConfig,
        DubContributions.Http,
        'http'
      )
  );
}

export function addDubConfig(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDubServices>().dubConfig,
    (container: IDubServices & IDomainServices) =>
      new DubConfig(
        container.appConfig,
        container.dubCachingOpts,
        container.dubHttpOpts
      )
  );
}

export function addJsonClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDubServices>().dubJsonClient,
    (container: IDubServices & IDomainServices) =>
      createJsonClient(
        {
          caching: container.dubCachingOpts,
          http: container.dubHttpOpts
        },
        container.logger.child({ namespace: 'dub request' })
      )
  );
}

export function addDubClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IDubServices>().dubClient,
    (container: IDubServices & IDomainServices) =>
      new DubClient(
        container.dubConfig,
        container.dubJsonClient,
        container.logger.child({ namespace: 'dub client' })
      )
  );
}

export function addSuggestionProvider(services: IServiceCollection) {
  services.addScoped(
    nameOf<IProviderServices>().suggestionProvider,
    (container: IDubServices & IDomainServices) =>
      new DubSuggestionProvider(
        container.dubClient,
        container.logger.child({ namespace: 'dub provider' })
      )
  );
}