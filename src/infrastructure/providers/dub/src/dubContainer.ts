import { IServiceCollection, IServiceProvider } from 'domain/di';
import {
  addCachingOptions,
  addDubConfig,
  addDubClient,
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

  addDubConfig(services);

  addJsonClient(services);

  addDubClient(services);

  addSuggestionProvider(services);

  return await services.buildScope("dub", serviceProvider);
}