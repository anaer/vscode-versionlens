import { throwNull, throwUndefined } from '@esm-test/guards';
import { ILogger } from 'domain/logging';
import { IconCommandContributions, VersionLensState } from 'presentation.extension';
import { Disposable, OutputChannel, commands } from 'vscode';

export class OnShowError {

  constructor(
    readonly state: VersionLensState,
    readonly outputChannel: OutputChannel,
    readonly logger: ILogger
  ) {
    throwUndefined("state", state);
    throwNull("state", state);

    throwUndefined("outputChannel", outputChannel);
    throwNull("outputChannel", outputChannel);

    throwUndefined("logger", logger);
    throwNull("logger", logger);

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