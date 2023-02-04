// vscode references
import { ILogger } from 'domain/logging';
import { getSuggestionProvidersByFileName } from 'application/providers';
import { CommandUtils, VersionLensProvider } from 'presentation.extension';
import * as VsCode from 'vscode';
import { IconCommandContributions } from '../definitions/eIconCommandContributions';
import { VersionLensState } from '../state/versionLensState';

export class IconCommands {

  state: VersionLensState;

  outputChannel: VsCode.OutputChannel;

  versionLensProviders: Array<VersionLensProvider>;

  constructor(
    state: VersionLensState,
    outputChannel: VsCode.OutputChannel,
    versionLensProviders: Array<VersionLensProvider>
  ) {
    this.state = state;
    this.outputChannel = outputChannel;
    this.versionLensProviders = versionLensProviders;
  }

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
    this.state.enabled.change(true)
      .then(_ => {
        this.refreshActiveCodeLenses();
      });
  }

  onHideVersionLenses(resourceUri: VsCode.Uri) {
    this.state.enabled.change(false)
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
    const providers = getSuggestionProvidersByFileName(
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

}

export function registerIconCommands(
  state: VersionLensState,
  versionLensProviders: Array<VersionLensProvider>,
  subscriptions: Array<VsCode.Disposable>,
  outputChannel: VsCode.OutputChannel,
  logger: ILogger
): IconCommands {

  // create the dependency
  const iconCommands = new IconCommands(
    state,
    outputChannel,
    versionLensProviders
  );

  // register commands with vscode
  subscriptions.push(
    ...CommandUtils.registerCommands(
      IconCommandContributions,
      <any>iconCommands,
      logger
    )
  );

  return iconCommands;
}