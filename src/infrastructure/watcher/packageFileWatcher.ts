import { throwUndefinedOrNull } from '@esm-test/guards';
import { IDisposable } from 'domain/generics';
import { ILogger } from 'domain/logging';
import {
  DependencyCache,
  IPackageFileWatcher,
  OnPackageDependenciesUpdatedFunction,
  OnPackageFileUpdatedFunction,
  hasPackageDepsChanged
} from 'domain/packages';
import { ISuggestionProvider } from 'domain/suggestions';
import { readFile } from 'domain/utils';
import { Uri } from 'vscode';
import { IWorkspaceAdapter } from './iWorkspaceAdapter';

export class PackageFileWatcher implements IPackageFileWatcher, IDisposable {

  constructor(
    readonly workspaceAdapter: IWorkspaceAdapter,
    readonly providers: ISuggestionProvider[],
    readonly dependencyCache: DependencyCache,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("workspaceAdapter", workspaceAdapter);
    throwUndefinedOrNull("providers", providers);
    throwUndefinedOrNull("dependencyCache", dependencyCache);
    throwUndefinedOrNull("logger", logger);

    this.disposables = [];
  }

  private disposables: IDisposable[];

  private packageDependenciesUpdatedListener: OnPackageDependenciesUpdatedFunction;

  private packageFileUpdatedListener: OnPackageFileUpdatedFunction;

  async initialize(): Promise<void> {

    for (const provider of this.providers) {
      const files = await this.workspaceAdapter.findFiles(
        provider.config.fileMatcher.pattern,
        '**​/node_modules/**'
      );
      for (const file of files) {
        await this.onFileAdd(provider, file)
      }
    }

    this.watch();
  }

  watch(): IPackageFileWatcher {
    // watch files
    this.providers.forEach(provider => {
      const watcher = this.workspaceAdapter.createFileSystemWatcher(
        provider.config.fileMatcher.pattern
      );

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

  registerOnPackageDependenciesUpdated(
    listener: OnPackageDependenciesUpdatedFunction,
    thisArg: any,
  ): void {
    this.packageDependenciesUpdatedListener = listener.bind(thisArg);
  }

  registerOnPackageFileUpdated(
    listener: OnPackageFileUpdatedFunction,
    thisArg: any
  ): void {
    this.packageFileUpdatedListener = listener.bind(thisArg);
  }

  async dispose(): Promise<void> {
    this.disposables.forEach(async disposable => await disposable.dispose());
  }

  async onFileAdd(provider: ISuggestionProvider, uri: Uri) {
    this.logger.silly("File added '%s'", uri);
    await this.updateCacheFromFile(provider.name, uri.fsPath, provider);
  }

  private async onFileCreate(provider: ISuggestionProvider, uri: Uri) {
    this.logger.silly("File created '%s'", uri);
    await this.updateCacheFromFile(provider.name, uri.fsPath, provider);
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

    // notify dependencies updated to listener
    if (this.packageDependenciesUpdatedListener && hasChanged) {
      await this.packageDependenciesUpdatedListener(provider, packageFilePath, latestDeps);
    }

    // update cache
    if (hasChanged) {
      this.logger.debug("Updating package dependency cache for '%s'", uri);
      this.dependencyCache.set(provider.name, packageFilePath, latestDeps);
    }

    // notify file updated to listener
    if (this.packageFileUpdatedListener) {
      await this.packageFileUpdatedListener(provider, packageFilePath, latestDeps);
    }
  }

  private async updateCacheFromFile(providerName: string, packageFilePath: string, provider: ISuggestionProvider) {
    const fileContent = await readFile(packageFilePath);
    const parsedDeps = provider.parseDependencies(packageFilePath, fileContent);
    this.dependencyCache.set(providerName, packageFilePath, parsedDeps);
  }

}