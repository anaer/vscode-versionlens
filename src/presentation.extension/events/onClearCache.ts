import { throwNull, throwUndefined } from '@esm-test/guards';
import { IExpiryCache } from 'domain/caching';
import { ILogger } from 'domain/logging';
import { PackageCache } from 'domain/packages';
import { SuggestionCommandContributions } from 'presentation.extension';
import { Disposable, commands } from 'vscode';

export class OnClearCache {

  constructor(
    readonly packageCache: PackageCache,
    readonly processesCache: IExpiryCache,
    readonly logger: ILogger
  ) {
    throwUndefined("packageCache", packageCache);
    throwNull("packageCache", packageCache);

    throwUndefined("processesCache", processesCache);
    throwNull("processesCache", processesCache);

    throwUndefined("logger", logger);
    throwNull("logger", logger);

    // register the vscode command
    this.disposable = commands.registerCommand(
      SuggestionCommandContributions.ClearCacheCommand,
      this.execute,
      this
    );
  }

  disposable: Disposable;

  /**
   * Clears all suggestion provider caches
   */
  execute() {
    this.logger.debug("Clearing packages cache");
    this.packageCache.clear();
    this.processesCache.clear();
  }

  async dispose() {
    this.disposable.dispose();
    this.logger.debug("disposed");
  }

}