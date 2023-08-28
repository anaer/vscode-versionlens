import { throwUndefinedOrNull } from '@esm-test/guards';
import { ILogger } from 'domain/logging';
import { IconCommandContributions, VersionLensState } from 'presentation.extension';
import { Disposable, OutputChannel, commands } from 'vscode';

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
    await Promise.all([
      this.state.providerError.change(false),
      this.state.providerBusy.change(0)
    ])

    this.outputChannel.show();
  }

  async dispose() {
    this.disposable.dispose();
    this.logger.debug("disposed");
  }

}