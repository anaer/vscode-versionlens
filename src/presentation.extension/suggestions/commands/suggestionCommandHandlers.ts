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

  // command disposables
  disposables: Array<VsCode.Disposable>

  onUpdateDependencyCommand(codeLens: VersionLens, packageVersion: string) {
    if ((<any>codeLens).__replaced) return Promise.resolve();

    const edit = new WorkspaceEdit();
    edit.replace(codeLens.documentUrl, codeLens.replaceRange, packageVersion);

    return workspace.applyEdit(edit)
      .then(done => (<any>codeLens).__replaced = true);
  }

  onFileLinkCommand(codeLens: VersionLens) {

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

    env.openExternal(<any>('file:///' + filePathToOpen));
  }

  dispose() {
    this.disposables.forEach(x => x.dispose());
    this.logger.debug(`disposed ${SuggestionCommandHandlers.name}`);
  }

}
