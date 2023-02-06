import { CachingOptions, HttpOptions } from "domain/clients";
import { IServiceCollection, ServiceInjectionMode } from "domain/di";
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
      ),
    ServiceInjectionMode.proxy
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
      ),
    ServiceInjectionMode.proxy
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
      ),
    ServiceInjectionMode.proxy
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
      ),
    ServiceInjectionMode.proxy
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
      ),
    ServiceInjectionMode.proxy
  );
}

export function addSuggestionProvider(services: IServiceCollection) {
  services.addSingleton(
    nameOf<ComposerService>().composerSuggestionProvider,
    (container: ComposerService & DomainService) =>
      new ComposerSuggestionProvider(
        container.composerClient,
        container.logger.child({ namespace: 'composer provider' })
      ),
    ServiceInjectionMode.proxy
  );
}