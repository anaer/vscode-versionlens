import { throwUndefinedOrNull } from '@esm-test/guards';
import { ILogger } from 'domain/logging';
import { SuggestionTypes, mapToSuggestionUpdate } from 'domain/suggestions';
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
  async execute(codeLens: SuggestionCodeLens): Promise<void> {
    const { version, type } = codeLens.package.suggestion;
    const isTag = type & SuggestionTypes.tag;
    const isPrerelease = type & SuggestionTypes.prerelease;
    const suggestionUpdate = mapToSuggestionUpdate(codeLens.package);
    const replaceWithVersion: string = isPrerelease || isTag
      ? version
      : codeLens.replaceVersionFn(suggestionUpdate, version);

    // create and apply the edit
    const edit = new WorkspaceEdit();
    edit.replace(codeLens.documentUrl, codeLens.replaceRange, replaceWithVersion);
    await workspace.applyEdit(edit);
  }

  async dispose() {
    this.disposable.dispose();
    this.logger.debug("disposed");
  }

}