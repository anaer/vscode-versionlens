import { throwNull, throwUndefined } from '@esm-test/guards';
import { ILogger } from 'domain/logging';
import {
  IconCommandContributions,
  SuggestionCodeLensProvider,
  VersionLensState
} from 'presentation.extension';
import { Disposable, commands } from 'vscode';
import { refreshActiveCodeLenses } from './eventUtils';

export class OnToggleReleases {

  constructor(
    readonly suggestionCodeLensProvider: SuggestionCodeLensProvider[],
    readonly state: VersionLensState,
    readonly logger: ILogger
  ) {
    throwUndefined("suggestionCodeLensProvider", suggestionCodeLensProvider);
    throwNull("suggestionCodeLensProvider", suggestionCodeLensProvider);

    throwUndefined("state", state);
    throwNull("state", state);

    throwUndefined("logger", logger);
    throwNull("logger", logger);

    // register the vscode commands
    this.disposables.push(
      commands.registerCommand(
        IconCommandContributions.ShowVersionLenses,
        this.execute.bind(this, true)
      ),
      commands.registerCommand(
        IconCommandContributions.HideVersionLenses,
        this.execute.bind(this, false)
      ),
    );
  }

  disposables: Disposable[] = [];

  async execute(toggle: boolean): Promise<void> {
    await this.state.show.change(toggle)
    refreshActiveCodeLenses(this.suggestionCodeLensProvider);
  }

  async dispose() {
    this.disposables.forEach(x => x.dispose());
    this.logger.debug("disposed");
  }

}