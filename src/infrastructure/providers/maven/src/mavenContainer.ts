import { IServiceCollection, IServiceProvider } from 'domain/di';
import {
  addCachingOptions,
  addCliClient,
  addMavenConfig,
  addHttpClient,
  addHttpOptions,
  addMavenClient,
  addProcessClient,
  addSuggestionProvider
} from './services';

export async function configureContainer(
  serviceProvider: IServiceProvider,
  services: IServiceCollection
): Promise<IServiceProvider> {

  addCachingOptions(services);

  addHttpOptions(services);

  addMavenConfig(services);

  addProcessClient(services);

  addCliClient(services);

  addHttpClient(services);

  addMavenClient(services);

  addSuggestionProvider(services);

  return await services.buildScope("maven", serviceProvider);
}