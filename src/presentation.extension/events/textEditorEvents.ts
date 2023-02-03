import { getSuggestionProvidersByFileName } from 'application/providers';
import { ILoggerChannel } from 'domain/logging';
import { ProviderSupport } from 'domain/providers';
import { ISuggestionProvider } from 'domain/suggestions';
import { TextEditor, window } from 'vscode';
import { VersionLensState } from '../state/versionLensState';

export class TextEditorEvents {

  constructor(
    state: VersionLensState,
    suggestionProviders: Array<ISuggestionProvider>,
    loggerChannel: ILoggerChannel
  ) {
    this.state = state;
    this.suggestionProviders = suggestionProviders;
    this.loggerChannel = loggerChannel;

    // register editor events
    window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor, this);
  }

  state: VersionLensState;

  suggestionProviders: Array<ISuggestionProvider>;

  loggerChannel: ILoggerChannel;

  onDidChangeActiveTextEditor(textEditor: TextEditor) {
    // maintain versionLens.providerActive state
    // each time the active editor changes

    if (!textEditor) {
      // disable icons when no editor
      this.state.providerActive.value = false;
      return;
    }

    if (textEditor.document.uri.scheme !== 'file') return;

    const providersMatchingFilename = getSuggestionProvidersByFileName(
      textEditor.document.fileName,
      this.suggestionProviders
    );

    if (providersMatchingFilename.length === 0) {
      // disable icons if no match found
      this.state.providerActive.value = false;
      return;
    }

    // ensure the latest logging level is set
    this.loggerChannel.refreshLoggingLevel();

    // determine prerelease support
    const providerSupportsPrereleases = providersMatchingFilename.reduce(
      (v, p) => p.config.supports.includes(ProviderSupport.Prereleases)
      , false
    );

    this.state.providerSupportsPrereleases.value = providerSupportsPrereleases;
    this.state.providerActive.value = true;
  }

}