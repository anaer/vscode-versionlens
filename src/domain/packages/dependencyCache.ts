import { ICache, MemoryCache } from "domain/caching";
import { KeyDictionary } from "domain/generics";
import { PackageDependency } from "domain/packages";

export class DependencyCache {

  readonly providerMaps: KeyDictionary<ICache> = {};

  constructor(providerNames: Array<string>) {
    providerNames.forEach(
      k => this.providerMaps[k] = new MemoryCache(`${k}-dependency-cache`)
    );
  }

  get(providerName: string, packageFilePath: string): PackageDependency[] {
    // get the package file cache for the provider
    const packageFilesCache = this.providerMaps[providerName];

    // get the cache entry
    return packageFilesCache.get(packageFilePath);
  }

  set(providerName: string, packageFilePath: string, dependencies: PackageDependency[]): void {
    // get the package file cache for the provider
    const packageFilesCache = this.providerMaps[providerName];

    // set the cache entry
    packageFilesCache.set(packageFilePath, dependencies);
  }

  remove(providerName: string, packageFilePath: string) {
    // get the package file cache for the provider
    const packageFilesCache = this.providerMaps[providerName];

    // remove the cache entry
    packageFilesCache.remove(packageFilePath);
  }

  clear(): void {
    // get the provider names
    const providerNames = Object.keys(this.providerMaps);

    // clear each provider cache
    providerNames.forEach(
      k => this.providerMaps[k].clear()
    );
  }

}