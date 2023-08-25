import { throwNull, throwUndefined } from '@esm-test/guards';
import { ICache, MemoryCache } from 'domain/caching';
import { IDisposable } from 'domain/generics';
import { ILogger } from 'domain/logging';
import { PackageDependency, hasPackageDepsChanged } from 'domain/packages';
import { IPackageDependencyWatcher, ISuggestionProvider, OnChangeFunction } from 'domain/suggestions';
import { readFile } from 'domain/utils';
import { dirname } from 'node:path';
import { Uri, workspace } from 'vscode';

export class PackageDependencyWatcher implements IPackageDependencyWatcher, IDisposable {

  constructor(
    readonly providers: ISuggestionProvider[],
    readonly packageDependencyCache: ICache,
    readonly changedPackageDependencyCache: ICache,
    readonly logger: ILogger
  ) {
    throwUndefined("providers", providers);
    throwNull("providers", providers);

    throwUndefined("packageDependencyCache", packageDependencyCache);
    throwNull("packageDependencyCache", packageDependencyCache);

    throwUndefined("changedPackageDependencyCache", changedPackageDependencyCache);
    throwNull("changedPackageDependencyCache", changedPackageDependencyCache);

    throwUndefined("logger", logger);
    throwNull("logger", logger);

    this.disposables = [];
    this.onDependenciesChangedListeners = [];
  }

  private disposables: IDisposable[];

  private onDependenciesChangedListeners: OnChangeFunction[];

  watch(): IPackageDependencyWatcher {

    // find existing files
    this.providers.forEach(async provider => {
      const files = await workspace.findFiles(
        provider.config.fileMatcher.pattern,
        '**​/node_modules/**'
      );

      files.forEach(async file => await this.onFileAdd(provider, file));
    });

    // watch files
    this.providers.forEach(provider => {
      const watcher = workspace.createFileSystemWatcher(provider.config.fileMatcher.pattern)

      this.logger.debug(
        `Created watcher for '%s' with pattern '%s'`,
        provider.name,
        provider.config.fileMatcher.pattern
      );

      this.disposables.push(
        watcher.onDidCreate(this.onFileCreate.bind(this, provider)),
        watcher.onDidDelete(this.onFileDelete.bind(this, provider)),
        watcher.onDidChange(this.onFileChange.bind(this, provider)),
        watcher
      );
    });

    return this;
  }

  updateDependencies(providerName: string, packagePath: string, content: string): PackageDependency[] {
    // get the provider
    const provider = this.providers.find(p => p.name == providerName);

    // parse the content to dependencies
    this.logger.info("Parsing %s dependencies in %s", providerName, packagePath);
    const latestDeps = provider.parseDependencies(packagePath, content);

    // create the cache key
    const cacheKey = MemoryCache.createKey(providerName, packagePath);

    // store the changed dependencies
    this.logger.debug("Caching %s dependencies from %s", providerName, packagePath);
    this.changedPackageDependencyCache.set<PackageDependency[]>(cacheKey, latestDeps);

    // return changed dependencies to caller
    return latestDeps;
  }

  registerOnDependenciesChange(listener: OnChangeFunction): void {
    this.onDependenciesChangedListeners.push(listener);
  }

  async dispose(): Promise<void> {
    this.disposables.forEach(async disposable => await disposable.dispose());
  }

  private async fireOnDependenciesChange(
    provider: ISuggestionProvider,
    packageDeps: PackageDependency[]
  ): Promise<boolean> {

    for (const listener of this.onDependenciesChangedListeners) {
      const ok = await listener(provider, packageDeps);
      if (ok == false) {
        return true;
      }
    }

    return false;
  }

  private async onFileAdd(provider: ISuggestionProvider, uri: Uri) {
    this.logger.silly("File added '%s'", uri);

    const packagePath = dirname(uri.fsPath);
    const cacheKey = MemoryCache.createKey(provider.name, packagePath);
    await this.updateCaches(cacheKey, uri, provider);
  }

  private async onFileCreate(provider: ISuggestionProvider, uri: Uri) {
    this.logger.silly("File created '%s'", uri);

    const packagePath = dirname(uri.fsPath);
    const cacheKey = MemoryCache.createKey(provider.name, packagePath);
    await this.updateCaches(cacheKey, uri, provider);
  }

  private onFileDelete(provider: ISuggestionProvider, uri: Uri) {
    this.logger.silly("File removed '%s'", uri);

    const packagePath = dirname(uri.fsPath);
    const cacheKey = MemoryCache.createKey(provider.name, packagePath);
    this.packageDependencyCache.remove(cacheKey);
    this.changedPackageDependencyCache.remove(cacheKey);
  }

  private async onFileChange(provider: ISuggestionProvider, uri: Uri) {
    this.logger.silly("File changed '%s'", uri);

    const packagePath = dirname(uri.fsPath);
    const fileContent = await readFile(uri.fsPath);

    const cacheKey = MemoryCache.createKey(provider.name, packagePath);
    const currentDeps = this.packageDependencyCache.get<PackageDependency[]>(cacheKey);
    const latestDeps = provider.parseDependencies(uri.fsPath, fileContent);
    const hasChanged = hasPackageDepsChanged(currentDeps, latestDeps);

    // notify change to listener
    let cancelUpdate = true;
    if (this.onDependenciesChangedListeners && hasChanged) {
      cancelUpdate = await this.fireOnDependenciesChange(provider, latestDeps);
    }

    // update caches
    if (cancelUpdate == false && hasChanged) {
      this.logger.debug("Updating package dependency cache for '%s'", uri);
      this.packageDependencyCache.set<PackageDependency[]>(cacheKey, latestDeps);
      this.changedPackageDependencyCache.set<PackageDependency[]>(cacheKey, latestDeps);
    }
  }

  private async updateCaches(cacheKey: string, uri: Uri, provider: ISuggestionProvider) {
    const fileContent = await readFile(uri.fsPath);
    const packageDeps = provider.parseDependencies(uri.fsPath, fileContent);
    this.packageDependencyCache.set<PackageDependency[]>(cacheKey, packageDeps);
    this.changedPackageDependencyCache.set<PackageDependency[]>(cacheKey, packageDeps);
  }

}