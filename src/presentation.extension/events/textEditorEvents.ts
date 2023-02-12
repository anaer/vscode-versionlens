import { IDispose, Undefinable } from 'domain/generics';
import { ILogger, ILoggerChannel } from 'domain/logging';
import { ProviderSupport } from 'domain/providers';
import { ISuggestionProvider } from 'domain/suggestions';
import { Disposable, TextEditor, window } from 'vscode';
import { VersionLensState } from '../state/versionLensState';
import { getDocumentProviders } from './textDocumentUtils';

export class TextEditorEvents implements IDispose {

  constructor(
    state: VersionLensState,
    suggestionProviders: Array<ISuggestionProvider>,
    loggerChannel: ILoggerChannel,
    logger: ILogger
  ) {
    this.state = state;
    this.suggestionProviders = suggestionProviders;
    this.loggerChannel = loggerChannel;
    this.logger = logger;

    // register editor events
    this.disposable = window.onDidChangeActiveTextEditor(
      this.onDidChangeActiveTextEditor,
      this
    );

    // ensure we fire after the extension is loaded
    this.onDidChangeActiveTextEditor(window.activeTextEditor);
  }

  state: VersionLensState;

  suggestionProviders: Array<ISuggestionProvider>;

  loggerChannel: ILoggerChannel;

  logger: ILogger;

  disposable: Disposable;

  onDidChangeActiveTextEditor(textEditor: Undefinable<TextEditor>) {
    // maintain versionLens.providerActive state
    // each time the active editor changes
    if (!textEditor) {
      // disable icons when no editor
      this.state.providerActive.value = false;
      return;
    }

    const providers = getDocumentProviders(
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

  dispose() {
    this.disposable.dispose();
    this.logger.debug(`disposed ${TextEditorEvents.name}`);
  }

}