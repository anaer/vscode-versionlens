import { throwUndefinedOrNull } from '@esm-test/guards';
import { IDisposable } from 'domain/generics';
import { ILogger } from 'domain/logging';
import {
  DependencyCache,
  IPackageFileWatcher,
  OnPackageDependenciesChangedFunction,
  hasPackageDepsChanged
} from 'domain/packages';
import { ISuggestionProvider } from 'domain/suggestions';
import { IStorage } from 'infrastructure/storage';
import { Uri } from 'vscode';

export class PackageFileWatcher implements IPackageFileWatcher, IDisposable {

  constructor(
    readonly storage: IStorage,
    readonly providers: ISuggestionProvider[],
    readonly dependencyCache: DependencyCache,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("storage", storage);
    throwUndefinedOrNull("providers", providers);
    throwUndefinedOrNull("dependencyCache", dependencyCache);
    throwUndefinedOrNull("logger", logger);

    this.disposables = [];
  }

  private disposables: IDisposable[];

  packageDependenciesChangedListener: OnPackageDependenciesChangedFunction;

  async initialize(): Promise<void> {

    for (const provider of this.providers) {
      const files = await this.storage.findFiles(
        provider.config.fileMatcher.pattern,
        '**​/node_modules/**'
      );
      for (const file of files) {
        await this.onFileAdd(provider, file)
      }
    }

    this.watch();
  }

  watch(): void {
    // watch files
    this.providers.forEach(provider => {
      const watcher = this.storage.createFileSystemWatcher(
        provider.config.fileMatcher.pattern
      );

      this.logger.debug(
        `created watcher for '%s' with pattern '%s'`,
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
  }

  registerOnPackageDependenciesChanged(
    listener: OnPackageDependenciesChangedFunction,
    thisArg: any,
  ): void {
    this.packageDependenciesChangedListener = listener.bind(thisArg);
  }

  async dispose(): Promise<void> {
    this.disposables.forEach(async disposable => await disposable.dispose());
  }

  async onFileAdd(provider: ISuggestionProvider, uri: Uri) {
    this.logger.silly("file added '%s'", uri);
    await this.updateCacheFromFile(provider.name, uri.fsPath, provider);
  }

  private async onFileCreate(provider: ISuggestionProvider, uri: Uri) {
    this.logger.silly("file created '%s'", uri);
    await this.updateCacheFromFile(provider.name, uri.fsPath, provider);
  }

  private onFileDelete(provider: ISuggestionProvider, uri: Uri) {
    this.logger.silly("file removed '%s'", uri);
    this.dependencyCache.remove(provider.name, uri.fsPath);
  }

  async onFileChange(provider: ISuggestionProvider, uri: Uri) {
    this.logger.silly("file changed '%s'", uri);

    const packageFilePath = uri.fsPath;
    const fileContent = await this.storage.readFile(uri.fsPath);
    const currentDeps = this.dependencyCache.get(provider.name, packageFilePath);
    const latestDeps = provider.parseDependencies(uri.fsPath, fileContent);
    const hasChanged = hasPackageDepsChanged(currentDeps, latestDeps);

    // update cache
    if (hasChanged) {
      this.logger.debug("updating package dependency cache for '%s'", uri);
      this.dependencyCache.set(provider.name, packageFilePath, latestDeps);
    }

    // notify dependencies updated to listener
    if (hasChanged && this.packageDependenciesChangedListener) {
      await this.packageDependenciesChangedListener(
        provider,
        packageFilePath,
        latestDeps
      );
    }
  }

  private async updateCacheFromFile(providerName: string, packageFilePath: string, provider: ISuggestionProvider) {
    const fileContent = await this.storage.readFile(packageFilePath);
    const parsedDeps = provider.parseDependencies(packageFilePath, fileContent);
    this.dependencyCache.set(providerName, packageFilePath, parsedDeps);
  }

}