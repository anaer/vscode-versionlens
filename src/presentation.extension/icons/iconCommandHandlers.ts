// vscode references
import { getProvidersByFileName } from 'application/providers';
import { IDisposable } from 'domain/generics';
import { ILogger } from 'domain/logging';
import {
  CommandUtils,
  IconCommandContributions,
  SuggestionCodeLensProvider
} from 'presentation.extension';
import * as VsCode from 'vscode';
import { VersionLensState } from '../state/versionLensState';

export class IconCommandHandlers implements IDisposable {

  constructor(
    state: VersionLensState,
    outputChannel: VsCode.OutputChannel,
    versionLensProviders: Array<SuggestionCodeLensProvider>,
    logger: ILogger
  ) {
    this.state = state;
    this.outputChannel = outputChannel;
    this.versionLensProviders = versionLensProviders;
    this.logger = logger;

    // register the commands
    this.disposables = CommandUtils.registerCommands(
      IconCommandContributions,
      <any>this,
      logger
    );
  }

  state: VersionLensState;

  outputChannel: VsCode.OutputChannel;

  versionLensProviders: Array<SuggestionCodeLensProvider>;

  logger: ILogger;

  // command disposables
  disposables: Array<VsCode.Disposable>

  async onShowError(resourceUri: VsCode.Uri) {
    await Promise.all([
      this.state.providerError.change(false),
      this.state.providerBusy.change(0)
    ])

    this.outputChannel.show();
  }

  async onShowVersionLenses(resourceUri: VsCode.Uri) {
    await this.state.show.change(true)
    this.refreshActiveCodeLenses();
  }

  async onHideVersionLenses(resourceUri: VsCode.Uri) {
    await this.state.show.change(false)
    this.refreshActiveCodeLenses();
  }

  async onShowPrereleaseVersions(resourceUri: VsCode.Uri) {
    await this.state.prereleasesEnabled.change(true)
    this.refreshActiveCodeLenses();
  }

  async onHidePrereleaseVersions(resourceUri: VsCode.Uri) {
    await this.state.prereleasesEnabled.change(false)
    this.refreshActiveCodeLenses();
  }

  onShowingProgress(resourceUri: VsCode.Uri) { }

  refreshActiveCodeLenses() {
    const { window } = VsCode;
    if (!window.activeTextEditor) return;

    const fileName = window.activeTextEditor.document.fileName;
    const providers = getProvidersByFileName(
      fileName,
      this.versionLensProviders
    )
    if (!providers) return false;

    providers.forEach(provider => provider.reloadCodeLenses());

    return true;
  }

  async dispose() {
    this.disposables.forEach(x => x.dispose());
    this.logger.debug(`disposed ${IconCommandHandlers.name}`);
  }

}