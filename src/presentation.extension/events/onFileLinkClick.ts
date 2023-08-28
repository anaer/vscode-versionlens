import { throwUndefinedOrNull } from '@esm-test/guards';
import { ILogger } from 'domain/logging';
import { PackageClientSourceType } from 'domain/packages';
import { SuggestionCodeLens, SuggestionCommandContributions } from 'presentation.extension';
import { Disposable, commands, env } from 'vscode';

export class OnFileLinkClick {

  constructor(readonly logger: ILogger) {
    throwUndefinedOrNull("logger", logger);

    // register the vscode command
    this.disposable = commands.registerCommand(
      SuggestionCommandContributions.FileLinkClicked,
      this.execute,
      this
    );
  }

  disposable: Disposable;

  /**
   * Executes when a codelens file link suggestion is clicked
   * @param codeLens
   */
  async execute(codeLens: SuggestionCodeLens, filePath: string): Promise<void> {
    if (codeLens.package.source !== PackageClientSourceType.Directory) {
      this.logger.error(
        "can only open local directories.\nPackage: %o",
        codeLens.package
      );
      return;
    }

    await env.openExternal(<any>('file:///' + filePath));
  }

  async dispose() {
    this.disposable.dispose();
    this.logger.debug("disposed");
  }

}