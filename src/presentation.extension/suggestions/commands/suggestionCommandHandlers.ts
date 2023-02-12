import { IDispose } from 'domain/generics';
import { ILogger } from 'domain/logging';
import { PackageClientSourceType } from 'domain/packages';
import { CommandUtils, SuggestionCodeLens } from 'presentation.extension';
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
   * @returns 
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

  dispose() {
    this.disposables.forEach(x => x.dispose());
    this.logger.debug(`disposed ${SuggestionCommandHandlers.name}`);
  }

}
