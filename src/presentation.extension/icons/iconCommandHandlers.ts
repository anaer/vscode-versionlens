// vscode references
import { getProvidersByFileName } from 'application/providers';
import { VersionLensProvider } from 'presentation.extension';
import * as VsCode from 'vscode';
import { VersionLensState } from '../state/versionLensState';

export class IconCommandHandlers {

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

}