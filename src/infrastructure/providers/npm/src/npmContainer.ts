import { IServiceCollection, IServiceProvider } from 'domain/di';
import {
  addCachingOptions,
  addNpmConfig,
  addGitHubClient,
  addGithubOptions,
  addHttpOptions,
  addJsonClient,
  addNpmPackageClient,
  addPacoteClient,
  addSuggestionProvider
} from './services';

export async function configureContainer(
  serviceProvider: IServiceProvider,
  services: IServiceCollection
): Promise<IServiceProvider> {

  addCachingOptions(services);

  addHttpOptions(services);

  addGithubOptions(services);

  addNpmConfig(services);

  addJsonClient(services);

  addGitHubClient(services);

  addPacoteClient(services);

  addNpmPackageClient(services);

  addSuggestionProvider(services);

  return await services.buildScope("npm", serviceProvider);
}