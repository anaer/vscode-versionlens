import { throwUndefinedOrNull } from '@esm-test/guards';
import { ILogger } from 'domain/logging';
import { IconCommandContributions, VersionLensState } from 'presentation.extension';
import { Disposable, OutputChannel, commands, window } from 'vscode';

export class OnShowError {

  constructor(
    readonly state: VersionLensState,
    readonly outputChannel: OutputChannel,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("state", state);
    throwUndefinedOrNull("outputChannel", outputChannel);
    throwUndefinedOrNull("logger", logger);

    // register the vscode commands
    this.disposable = commands.registerCommand(
      IconCommandContributions.ShowError,
      this.execute,
      this
    );
  }

  disposable: Disposable;

  async execute(): Promise<void> {
    // show the version lens log window
    this.outputChannel.show();

    // clear the error state
    await Promise.all([
      this.state.providerError.change(false),
      this.state.providerBusy.change(0)
    ]);

    // focus on the document unhide icons
    window.showTextDocument(window.activeTextEditor.document);
  }

  async dispose() {
    this.disposable.dispose();
    this.logger.debug(`${OnShowError.name} disposed`);
  }

}