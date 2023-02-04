import { ILoggerChannel } from 'domain/logging';
import { ProviderSupport } from 'domain/providers';
import { ISuggestionProvider } from 'domain/suggestions';
import { TextEditor, window } from 'vscode';
import { getDocumentSuggestionProviders } from '../helpers/textDocumentUtils';
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

    // ensure we fire after the extension is loaded
    this.onDidChangeActiveTextEditor(window.activeTextEditor);
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

    const providers = getDocumentSuggestionProviders(
      textEditor.document,
      this.suggestionProviders
    );

    if (providers.length === 0) {
      // disable icons if no match found
      this.state.providerActive.value = false;
      return;
    }

    // ensure the latest logging level is set
    this.loggerChannel.refreshLoggingLevel();

    // determine prerelease support
    const providerSupportsPrereleases = providers.reduce(
      (v, p) => p.config.supports.includes(ProviderSupport.Prereleases),
      false
    );

    this.state.providerSupportsPrereleases.value = providerSupportsPrereleases;
    this.state.providerActive.value = true;
  }

}