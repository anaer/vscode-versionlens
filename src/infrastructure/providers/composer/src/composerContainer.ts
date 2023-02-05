import { IServiceCollection, IServiceProvider } from 'domain/di';
import {
  addCachingOptions,
  addComposerClient,
  addComposerConfig,
  addHttpOptions,
  addJsonClient,
  addSuggestionProvider
} from './services';

export async function configureContainer(
  serviceProvider: IServiceProvider,
  services: IServiceCollection
): Promise<IServiceProvider> {

  addCachingOptions(services);

  addHttpOptions(services);

  addComposerConfig(services);

  addJsonClient(services);

  addComposerClient(services);

  addSuggestionProvider(services);

  return await services.buildScope("composer", serviceProvider);
}