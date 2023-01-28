// vscode references
import minimatch from 'minimatch';
import { basename } from 'path';
import * as VsCode from 'vscode';
import { ILogger } from 'domain/logging';
import { CommandHelpers, VersionLensProvider } from 'presentation.extension';
import { IconCommandContributions } from '../definitions/eIconCommandContributions';
import * as InstalledStatusHelpers from '../helpers/installedStatusHelpers';
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

  onShowInstalledStatuses(resourceUri: VsCode.Uri) {
    this.state.installedStatusesEnabled.change(true)
      .then(_ => {
        this.refreshActiveCodeLenses();
      });
  }

  onHideInstalledStatuses(resourceUri: VsCode.Uri) {
    this.state.installedStatusesEnabled.change(false)
      .then(_ => {
        InstalledStatusHelpers.clearDecorations();
      });
  }

  onShowingProgress(resourceUri: VsCode.Uri) { }

  refreshActiveCodeLenses() {
    const { window } = VsCode;
    const fileName = window.activeTextEditor.document.fileName;
    const providers = filtersProvidersByFileName(
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

export function filtersProvidersByFileName(
  fileName: string,
  providers: Array<VersionLensProvider>
): Array<VersionLensProvider> {

  const filename = basename(fileName);

  const filtered = providers.filter(
    provider => minimatch(filename, provider.config.fileMatcher.pattern)
  );

  if (filtered.length === 0) return [];

  return filtered;
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
    ...CommandHelpers.registerCommands(
      IconCommandContributions,
      <any>iconCommands,
      logger
    )
  );

  return iconCommands;
}