import { CachingOptions, HttpOptions } from "domain/clients";
import { IServiceCollection } from "domain/di";
import { DomainService } from "domain/services/domainService";
import { nameOf } from "domain/utils";
import { createJsonClient } from "infrastructure/http";
import { ComposerClient } from "../composerClient";
import { ComposerConfig } from "../composerConfig";
import { ComposerSuggestionProvider } from "../composerSuggestionProvider";
import { ComposerContributions } from "../definitions/eComposerContributions";
import { ComposerService } from "./composerService";

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<ComposerService>().composerCachingOpts,
    (container: DomainService) =>
      new CachingOptions(
        container.appConfig,
        ComposerContributions.Caching,
        'caching'
      )
  );
}

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    nameOf<ComposerService>().composerHttpOpts,
    (container: DomainService) =>
      new HttpOptions(
        container.appConfig,
        ComposerContributions.Http,
        'http'
      )
  );
}

export function addComposerConfig(services: IServiceCollection) {
  services.addSingleton(
    nameOf<ComposerService>().composerConfig,
    (container: ComposerService & DomainService) =>
      new ComposerConfig(
        container.appConfig,
        container.composerCachingOpts,
        container.composerHttpOpts
      )
  );
}

export function addJsonClient(services: IServiceCollection) {
  services.addSingleton(
    nameOf<ComposerService>().composerJsonClient,
    (container: ComposerService & DomainService) =>
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
    nameOf<ComposerService>().composerClient,
    (container: ComposerService & DomainService) =>
      new ComposerClient(
        container.composerConfig,
        container.composerJsonClient,
        container.logger.child({ namespace: 'composer client' })
      )
  );
}

export function addSuggestionProvider(services: IServiceCollection) {
  services.addScoped(
    nameOf<DomainService>().suggestionProvider,
    (container: ComposerService & DomainService) =>
      new ComposerSuggestionProvider(
        container.composerClient,
        container.logger.child({ namespace: 'composer provider' })
      )
  );
}