import { CachingOptions, HttpOptions } from "domain/clients";
import { IServiceCollection } from "domain/di";
import { DomainService } from "domain/services/eDomainService";
import { createJsonClient } from "infrastructure/http";
import { ComposerClient } from "../composerClient";
import { ComposerConfig } from "../composerConfig";
import { ComposerSuggestionProvider } from "../composerSuggestionProvider";
import { ComposerContributions } from "../definitions/eComposerContributions";
import { ComposerService } from "./eComposerService";

export function addCachingOptions(services: IServiceCollection) {
  services.addSingleton(
    ComposerService.composerCachingOpts,
    appConfig => new CachingOptions(
      appConfig,
      ComposerContributions.Caching,
      'caching'
    )
  );
}

export function addHttpOptions(services: IServiceCollection) {
  services.addSingleton(
    ComposerService.composerHttpOpts,
    appConfig => new HttpOptions(
      appConfig,
      ComposerContributions.Http,
      'http'
    )
  );
}

export function addComposerConfig(services: IServiceCollection) {
  services.addSingleton(
    ComposerService.composerConfig,
    (appConfig, composerCachingOpts, composerHttpOpts) =>
      new ComposerConfig(appConfig, composerCachingOpts, composerHttpOpts)
  );
}

export function addJsonClient(services: IServiceCollection) {
  services.addSingleton(
    ComposerService.composerJsonClient,
    (composerCachingOpts, composerHttpOpts, logger) =>
      createJsonClient(
        {
          caching: composerCachingOpts,
          http: composerHttpOpts
        },
        logger.child({ namespace: 'composer request' })
      )
  );
}

export function addComposerClient(services: IServiceCollection) {
  services.addSingleton(
    ComposerService.composerClient,
    (composerConfig, composerJsonClient, logger) =>
      new ComposerClient(
        composerConfig,
        composerJsonClient,
        logger.child({ namespace: 'composer client' })
      )
  );
}

export function addSuggestionProvider(services: IServiceCollection) {
  services.addSingleton(
    `composer${DomainService.suggestionProvider}`,
    (composerClient, logger) =>
      new ComposerSuggestionProvider(
        composerClient,
        logger.child({ namespace: 'composer provider' })
      )
  );

}