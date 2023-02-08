import { IDispose } from 'domain/generics';
import { ILogger } from 'domain/logging';
import { PackageSourceType } from 'domain/packages';
import { dirname, resolve } from 'path';
import { CommandUtils, VersionLens } from 'presentation.extension';
import * as VsCode from 'vscode';
import { env, workspace, WorkspaceEdit } from 'vscode';
import { VersionLensState } from '../../state/versionLensState';
import {
  SuggestionCommandContributions
} from './eSuggestionCommandContributions';

export class SuggestionCommandHandlers implements IDispose {

  constructor(state: VersionLensState, logger: ILogger) {
    this.state = state;
    this.logger = logger;

    // register the commands
    this.disposables = CommandUtils.registerCommands(
      SuggestionCommandContributions,
      <any>this,
      logger
    );
  }

  state: VersionLensState;

  logger: ILogger;

  disposables: Array<VsCode.Disposable>

  /**
   * Executes when a codelens update suggestion is clicked
   * @param codeLens 
   * @param packageVersion 
   * @returns 
   */
  async onUpdateDependencyClicked(
    codeLens: VersionLens,
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
   * @returns 
   */
  async onFileLinkClicked(codeLens: VersionLens): Promise<void> {

    if (codeLens.package.source !== PackageSourceType.Directory) {
      this.logger.error(
        "onLinkCommand can only open local directories.\nPackage: %o",
        codeLens.package
      );
      return;
    }

    const filePathToOpen = resolve(
      dirname(codeLens.documentUrl.fsPath),
      codeLens.package.resolved.version
    );

    await env.openExternal(<any>('file:///' + filePathToOpen));
  }

  dispose() {
    this.disposables.forEach(x => x.dispose());
    this.logger.debug(`disposed ${SuggestionCommandHandlers.name}`);
  }

}
