import { throwUndefinedOrNull } from '@esm-test/guards';
import { ILogger } from 'domain/logging';
import { SuggestionCodeLens, SuggestionCommandContributions } from 'presentation.extension';
import { Disposable, WorkspaceEdit, commands, workspace } from 'vscode';

export class OnUpdateDependencyClick {

  constructor(readonly logger: ILogger) {
    throwUndefinedOrNull("logger", logger);

    // register the vscode command
    this.disposable = commands.registerCommand(
      SuggestionCommandContributions.OnUpdateDependencyClick,
      this.execute,
      this
    );
  }

  disposable: Disposable;

  /**
   * Executes when a codelens update suggestion is clicked
   * @param codeLens 
   * @param packageVersion 
   */
  async execute(codeLens: SuggestionCodeLens, packageVersion: string): Promise<void> {
    if ((<any>codeLens).__replaced) return;

    const edit = new WorkspaceEdit();
    edit.replace(codeLens.documentUrl, codeLens.replaceRange, packageVersion);

    await workspace.applyEdit(edit);

    (<any>codeLens).__replaced = true;
  }

  async dispose() {
    this.disposable.dispose();
    this.logger.debug("disposed");
  }

}