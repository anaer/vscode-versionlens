import { throwNull, throwUndefined } from '@esm-test/guards';
import { ICache, MemoryCache } from 'domain/caching';
import { IDisposable } from 'domain/generics';
import { ILogger } from 'domain/logging';
import { PackageDependency, hasPackageDepsChanged } from 'domain/packages';
import { IPackageDependencyWatcher, ISuggestionProvider, OnChangeFunction } from 'domain/suggestions';
import { readFile } from 'domain/utils';
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
  }

  disposables: IDisposable[];

  onDependenciesChanged: OnChangeFunction;

  watch(): IPackageDependencyWatcher {

    // find files
    this.providers.forEach(async p => {
      const files = await workspace.findFiles(p.config.fileMatcher.pattern)
      files.forEach(file => {
        this.onFileCreate(p, file)
      });
    });

    // watch files
    this.providers.forEach(p => {
      const watcher = workspace.createFileSystemWatcher(p.config.fileMatcher.pattern)

      this.logger.debug(
        `Created watcher for '%s' with pattern '%s'`,
        p.name,
        p.config.fileMatcher.pattern
      );

      this.disposables.push(
        watcher.onDidCreate(this.onFileCreate.bind(this, p)),
        watcher.onDidDelete(this.onFileDelete.bind(this, p)),
        watcher.onDidChange(this.onFileChange.bind(this, p)),
        watcher
      );
    });

    return this;
  }

  registerOnDependenciesChange(listener: OnChangeFunction): void {
    this.onDependenciesChanged = listener;
  }

  async onFileCreate(provider: ISuggestionProvider, uri: Uri) {
    this.logger.verbose("File created '%s'", uri);
    const cacheKey = MemoryCache.createKey(provider.name, uri.path);
    await this.updateOriginalCache(cacheKey, uri, provider);
  }

  onFileDelete(provider: ISuggestionProvider, uri: Uri) {
    this.logger.verbose("File removed '%s'", uri);
    const cacheKey = MemoryCache.createKey(provider.name, uri.path);
    this.packageDependencyCache.remove(cacheKey);
    this.changedPackageDependencyCache.remove(cacheKey);
  }

  async onFileChange(provider: ISuggestionProvider, uri: Uri) {
    this.logger.verbose("File changed '%s'", uri);
    const cacheKey = MemoryCache.createKey(provider.name, uri.path);
    const current = this.packageDependencyCache.get<PackageDependency[]>(cacheKey);
    const changed = this.changedPackageDependencyCache.get<PackageDependency[]>(cacheKey);
    const hasChanged = hasPackageDepsChanged(current, changed);

    // test if anything has changed
    let shouldUpdate = true;
    if (this.onDependenciesChanged && hasChanged) {
      shouldUpdate = await this.onDependenciesChanged(provider, this.logger);
    }

    if (shouldUpdate && hasChanged) {
      this.logger.debug("Updating package dependency cache for '%s'", uri);
      await this.updateOriginalCache(cacheKey, uri, provider);
    }
  }

  async dispose(): Promise<void> {
    for (let index = 0; index < this.disposables.length; index++) {
      const watcher = this.disposables[index];
      await watcher.dispose();
    }
  }

  private async updateOriginalCache(cacheKey: string, uri: Uri, provider: ISuggestionProvider) {
    const fileContent = await readFile(uri.fsPath);
    const packageDeps = provider.parseDependencies(uri.fsPath, fileContent);
    this.packageDependencyCache.set<PackageDependency[]>(cacheKey, packageDeps);
    this.changedPackageDependencyCache.set<PackageDependency[]>(cacheKey, packageDeps);
  }

}