import { throwUndefinedOrNull } from '@esm-test/guards';
import { ILogger } from 'domain/logging';
import {
  IconCommandContributions,
  SuggestionCodeLensProvider,
  VersionLensState
} from 'presentation.extension';
import { Disposable, commands } from 'vscode';

export class OnTogglePrereleases {

  constructor(
    readonly suggestionCodeLensProvider: SuggestionCodeLensProvider[],
    readonly state: VersionLensState,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("suggestionCodeLensProvider", suggestionCodeLensProvider);
    throwUndefinedOrNull("state", state);
    throwUndefinedOrNull("logger", logger);

    // register the vscode commands
    this.disposables.push(
      commands.registerCommand(
        IconCommandContributions.ShowPrereleaseVersions,
        this.execute.bind(this, true)
      ),
      commands.registerCommand(
        IconCommandContributions.HidePrereleaseVersions,
        this.execute.bind(this, false)
      )
    );
  }

  disposables: Disposable[] = [];

  async execute(toggle: boolean): Promise<void> {
    await this.state.showPrereleases.change(toggle);

    // refresh the active code lenses
    const providerName = this.state.providerActive.value;
    const codelensProvider = this.suggestionCodeLensProvider.find(
      x => x.providerName === providerName
    );

    codelensProvider && codelensProvider.reloadCodeLenses();
  }

  async dispose() {
    this.disposables.forEach(x => x.dispose());
    this.logger.debug(`disposed ${OnTogglePrereleases.name}`);
  }

}