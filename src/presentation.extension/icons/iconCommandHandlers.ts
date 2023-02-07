// vscode references
import { getProvidersByFileName } from 'application/providers';
import { IDispose } from 'domain/generics/iDispose';
import { ILogger } from 'domain/logging';
import {
  CommandUtils,
  IconCommandContributions,
  VersionLensProvider
} from 'presentation.extension';
import * as VsCode from 'vscode';
import { VersionLensState } from '../state/versionLensState';

export class IconCommandHandlers implements IDispose {

  constructor(
    state: VersionLensState,
    outputChannel: VsCode.OutputChannel,
    versionLensProviders: Array<VersionLensProvider>,
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

  versionLensProviders: Array<VersionLensProvider>;

  logger: ILogger;

  // command disposables
  disposables: Array<VsCode.Disposable>

  onShowError(resourceUri: VsCode.Uri) {
    return Promise.all([
      this.state.providerError.change(false),
      this.state.providerBusy.change(0)
    ])
      .then(_ => {
        this.outputChannel.show();
      });
  }

  onShowVersionLenses(resourceUri: VsCode.Uri) {
    this.state.show.change(true)
      .then(_ => {
        this.refreshActiveCodeLenses();
      });
  }

  onHideVersionLenses(resourceUri: VsCode.Uri) {
    this.state.show.change(false)
      .then(_ => {
        this.refreshActiveCodeLenses();
      });
  }

  onShowPrereleaseVersions(resourceUri: VsCode.Uri) {
    this.state.prereleasesEnabled.change(true)
      .then(_ => {
        this.refreshActiveCodeLenses();
      });
  }

  onHidePrereleaseVersions(resourceUri: VsCode.Uri) {
    this.state.prereleasesEnabled.change(false)
      .then(_ => {
        this.refreshActiveCodeLenses();
      });
  }

  onShowingProgress(resourceUri: VsCode.Uri) { }

  refreshActiveCodeLenses() {
    const { window } = VsCode;
    const fileName = window.activeTextEditor.document.fileName;
    const providers = getProvidersByFileName(
      fileName,
      this.versionLensProviders
    )
    if (!providers) return false;

    providers.forEach(
      provider => {
        provider.reloadCodeLenses()
      }
    );

    return true;
  }

  dispose() {
    this.disposables.forEach(x => x.dispose());
    this.logger.debug(`disposed ${IconCommandHandlers.name}`);
  }

}