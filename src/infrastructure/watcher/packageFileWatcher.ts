import { throwUndefinedOrNull } from '@esm-test/guards';
import { ILogger } from 'domain/logging';
import {
  DependencyCache,
  IPackageFileWatcher,
  OnPackageDependenciesChangedEvent
} from 'domain/packages';
import { DependencyChangesResult, GetDependencyChanges, ISuggestionProvider } from 'domain/suggestions';
import { AsyncEmitter, IDisposable } from 'domain/utils';
import { Uri } from 'vscode';
import { IWorkspaceAdapter } from '.';

export class PackageFileWatcher
  extends AsyncEmitter<OnPackageDependenciesChangedEvent>
  implements IPackageFileWatcher, IDisposable {

  constructor(
    readonly getDependencyChanges: GetDependencyChanges,
    readonly workspace: IWorkspaceAdapter,
    readonly providers: ISuggestionProvider[],
    readonly dependencyCache: DependencyCache,
    readonly logger: ILogger
  ) {
    super();
    throwUndefinedOrNull("getDependencyChanges", getDependencyChanges);
    throwUndefinedOrNull("workspace", workspace);
    throwUndefinedOrNull("providers", providers);
    throwUndefinedOrNull("dependencyCache", dependencyCache);
    throwUndefinedOrNull("logger", logger);

    this.disposables = [];
  }

  private disposables: IDisposable[];

  async initialize(): Promise<void> {

    for (const provider of this.providers) {
      const files = await this.workspace.findFiles(
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
      const watcher = this.workspace.createFileSystemWatcher(
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

  async dispose(): Promise<void> {
    this.disposables.forEach(async disposable => await disposable.dispose());
  }

  async onFileAdd(provider: ISuggestionProvider, uri: Uri) {
    this.logger.silly("file added '%s'", uri);
    await this.updateCacheFromFile(provider, uri.fsPath);
  }

  private async onFileCreate(provider: ISuggestionProvider, uri: Uri) {
    this.logger.silly("file created '%s'", uri);
    await this.updateCacheFromFile(provider, uri.fsPath);
  }

  private onFileDelete(provider: ISuggestionProvider, uri: Uri) {
    this.logger.silly("file removed '%s'", uri);
    this.dependencyCache.remove(provider.name, uri.fsPath);
  }

  async onFileChange(provider: ISuggestionProvider, uri: Uri) {
    this.logger.silly("file changed '%s'", uri);

    const packageFilePath = uri.fsPath;
    const result = await this.updateCacheFromFile(provider, packageFilePath);

    // notify dependencies updated to listener
    if (result.hasChanged) {
      await this.fire(
        provider,
        packageFilePath,
        result.parsedDependencies
      );
    }
  }

  private async updateCacheFromFile(
    provider: ISuggestionProvider,
    packageFilePath: string
  ): Promise<DependencyChangesResult> {

    const result = await this.getDependencyChanges.execute(provider, packageFilePath);
    if (result.hasChanged) {
      this.logger.debug("updating package dependency cache for '%s'", packageFilePath);
      this.dependencyCache.set(provider.name, packageFilePath, result.parsedDependencies);
    }

    return result;
  }

}