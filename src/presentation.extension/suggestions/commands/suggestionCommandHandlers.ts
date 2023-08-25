import { throwNull, throwUndefined } from '@esm-test/guards';
import { IExpiryCache } from 'domain/caching';
import { IDisposable } from 'domain/generics';
import { ILogger } from 'domain/logging';
import { PackageClientSourceType } from 'domain/packages';
import { CommandUtils, SuggestionCodeLens } from 'presentation.extension';
import * as VsCode from 'vscode';
import { WorkspaceEdit, env, workspace } from 'vscode';
import { SuggestionCommandContributions } from './eSuggestionCommandContributions';

export class SuggestionCommandHandlers implements IDisposable {

  constructor(
    readonly suggestionCache: IExpiryCache,
    readonly processesCache: IExpiryCache,
    readonly logger: ILogger
  ) {
    throwUndefined("suggestionCache", suggestionCache);
    throwNull("suggestionCache", suggestionCache);

    throwUndefined("processesCache", processesCache);
    throwNull("processesCache", processesCache);

    throwUndefined("logger", logger);
    throwNull("logger", logger);

    // register the commands
    this.disposables = CommandUtils.registerCommands(
      SuggestionCommandContributions,
      <any>this,
      logger
    );
  }

  disposables: Array<VsCode.Disposable>

  /**
   * Executes when a codelens update suggestion is clicked
   * @param codeLens 
   * @param packageVersion 
   */
  async onUpdateDependencyClicked(
    codeLens: SuggestionCodeLens,
    packageVersion: string
  ): Promise<void> {
    if ((<any>codeLens).__replaced) return;

    const edit = new WorkspaceEdit();
    edit.replace(codeLens.documentUrl, codeLens.replaceRange, packageVersion);

    await workspace.applyEdit(edit);

    (<any>codeLens).__replaced = true;
  }

  /**
   * Executes when a codelens file link suggestion is clicked
   * @param codeLens
   */
  async onFileLinkClicked(codeLens: SuggestionCodeLens, filePath: string): Promise<void> {
    if (codeLens.package.source !== PackageClientSourceType.Directory) {
      this.logger.error(
        "onLinkCommand can only open local directories.\nPackage: %o",
        codeLens.package
      );
      return;
    }

    await env.openExternal(<any>('file:///' + filePath));
  }

  /**
   * Clears all suggestion provider caches
   */
  onClearCacheCommand(): void {
    this.suggestionCache.clear();
    this.processesCache.clear();
  }

  async dispose() {
    this.disposables.forEach(x => x.dispose());
    this.logger.debug(`disposed ${SuggestionCommandHandlers.name}`);
  }

}