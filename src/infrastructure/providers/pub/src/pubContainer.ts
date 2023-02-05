import { IServiceCollection, IServiceProvider } from 'domain/di';
import {
  addCachingOptions,
  addPubConfig,
  addHttpOptions,
  addJsonClient,
  addPubClient,
  addSuggestionProvider
} from './services';

export async function configureContainer(
  serviceProvider: IServiceProvider,
  services: IServiceCollection
): Promise<IServiceProvider> {

  addCachingOptions(services);

  addHttpOptions(services);

  addPubConfig(services);

  addJsonClient(services);

  addPubClient(services);

  addSuggestionProvider(services);

  return await services.buildScope("pub", serviceProvider);
}