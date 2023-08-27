import { throwNull, throwUndefined } from '@esm-test/guards';
import { IDisposable } from 'domain/generics';
import { ILogger } from 'domain/logging';
import {
  DependencyCache,
  IPackageDependencyWatcher,
  OnPackageFileChangedFunction,
  hasPackageDepsChanged
} from 'domain/packages';
import { ISuggestionProvider } from 'domain/suggestions';
import { readFile } from 'domain/utils';
import { Uri, workspace } from 'vscode';

export class PackageDependencyWatcher implements IPackageDependencyWatcher, IDisposable {

  constructor(
    readonly providers: ISuggestionProvider[],
    readonly dependencyCache: DependencyCache,
    readonly logger: ILogger
  ) {
    throwUndefined("providers", providers);
    throwNull("providers", providers);

    throwUndefined("dependencyCache", dependencyCache);
    throwNull("dependencyCache", dependencyCache);

    throwUndefined("logger", logger);
    throwNull("logger", logger);

    this.disposables = [];
  }

  private disposables: IDisposable[];

  private packageFileChangedListener: OnPackageFileChangedFunction;

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

  registerOnPackageFileChanged(listener: OnPackageFileChangedFunction): void {
    this.packageFileChangedListener = listener;
  }

  async dispose(): Promise<void> {
    this.disposables.forEach(async disposable => await disposable.dispose());
  }

  private async onFileAdd(provider: ISuggestionProvider, uri: Uri) {
    this.logger.silly("File added '%s'", uri);
    await this.updateCacheFromFile(provider.name, uri.fsPath, provider);
  }

  private async onFileCreate(provider: ISuggestionProvider, uri: Uri) {
    this.logger.silly("File created '%s'", uri);
    await this.updateCacheFromFile(provider.name,  uri.fsPath, provider);
  }

  private onFileDelete(provider: ISuggestionProvider, uri: Uri) {
    this.logger.silly("File removed '%s'", uri);
    this.dependencyCache.remove(provider.name, uri.fsPath);
  }

  private async onFileChange(provider: ISuggestionProvider, uri: Uri) {
    this.logger.silly("File changed '%s'", uri);

    const packageFilePath = uri.fsPath;
    const fileContent = await readFile(uri.fsPath);
    const currentDeps = this.dependencyCache.get(provider.name, packageFilePath);
    const latestDeps = provider.parseDependencies(uri.fsPath, fileContent);
    const hasChanged = hasPackageDepsChanged(currentDeps, latestDeps);

    // notify change to listener
    let shouldUpdate = true;
    if (this.packageFileChangedListener && hasChanged) {
      shouldUpdate = await this.packageFileChangedListener(provider, latestDeps);
    }

    // update caches
    if (shouldUpdate && hasChanged) {
      this.logger.debug("Updating package dependency cache for '%s'", uri);
      this.dependencyCache.set(provider.name, packageFilePath, latestDeps);
    }
  }

  private async updateCacheFromFile(providerName: string, packageFilePath: string, provider: ISuggestionProvider) {
    const fileContent = await readFile(packageFilePath);
    const parsedDeps = provider.parseDependencies(packageFilePath, fileContent);
    this.dependencyCache.set(providerName, packageFilePath, parsedDeps);
  }

}