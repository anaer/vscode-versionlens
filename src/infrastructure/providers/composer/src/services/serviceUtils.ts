import { CachingOptions, HttpOptions } from "domain/clients";
import { IServiceCollection } from "domain/di";
import { IDomainServices, IProviderServices } from "domain/services";
import { nameOf } from "domain/utils";
import { createJsonClient } from "infrastructure/http";
import { ComposerClient } from "../composerClient";
import { ComposerConfig } from "../composerConfig";
import { ComposerSuggestionProvider } from "../composerSuggestionProvider";
import { ComposerContributions } from "../definitions/eComposerContributions";
import { IComposerService } from "./iComposerServices";

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IComposerService>().composerCachingOpts,
    (container: IDomainServices) =>
      new CachingOptions(
        container.appConfig,
        ComposerContributions.Caching,
        'caching'
      )
  );
}

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IComposerService>().composerHttpOpts,
    (container: IDomainServices) =>
      new HttpOptions(
        container.appConfig,
        ComposerContributions.Http,
        'http'
      )
  );
}

export function addComposerConfig(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IComposerService>().composerConfig,
    (container: IComposerService & IDomainServices) =>
      new ComposerConfig(
        container.appConfig,
        container.composerCachingOpts,
        container.composerHttpOpts
      )
  );
}

export function addJsonClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IComposerService>().composerJsonClient,
    (container: IComposerService & IDomainServices) =>
      createJsonClient(
        {
          caching: container.composerCachingOpts,
          http: container.composerHttpOpts
        },
        container.logger.child({ namespace: 'composer request' })
      )
  );
}

export function addComposerClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<IComposerService>().composerClient,
    (container: IComposerService & IDomainServices) =>
      new ComposerClient(
        container.composerConfig,
        container.composerJsonClient,
        container.logger.child({ namespace: 'composer client' })
      )
  );
}

export function addSuggestionProvider(services: IServiceCollection) {
  services.addScoped(
    nameOf<IProviderServices>().suggestionProvider,
    (container: IComposerService & IDomainServices) =>
      new ComposerSuggestionProvider(
        container.composerClient,
        container.logger.child({ namespace: 'composer provider' })
      )
  );
}