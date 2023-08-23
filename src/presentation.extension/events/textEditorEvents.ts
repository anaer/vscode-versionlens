import { throwNull, throwUndefined } from '@esm-test/guards';
import { IDisposable, Undefinable } from 'domain/generics';
import { ILogger, ILoggerChannel } from 'domain/logging';
import { ISuggestionProvider } from 'domain/suggestions';
import { Disposable, TextEditor, window } from 'vscode';
import { VersionLensState } from '../state/versionLensState';
import { getDocumentProviders } from './textDocumentUtils';

export class TextEditorEvents implements IDisposable {

  constructor(
    readonly state: VersionLensState,
    readonly suggestionProviders: Array<ISuggestionProvider>,
    readonly loggerChannel: ILoggerChannel,
    readonly logger: ILogger
  ) {
    throwUndefined("state", state);
    throwNull("state", state);

    throwUndefined("suggestionProviders", suggestionProviders);
    throwNull("suggestionProviders", suggestionProviders);

    throwUndefined("loggerChannel", loggerChannel);
    throwNull("loggerChannel", loggerChannel);

    throwUndefined("logger", logger);
    throwNull("logger", logger);

    // register editor events
    this.disposable = window.onDidChangeActiveTextEditor(
      this.onDidChangeActiveTextEditor,
      this
    );

    // ensure we fire after the extension is loaded
    this.onDidChangeActiveTextEditor(window.activeTextEditor);
  }

  disposable: Disposable;

  onDidChangeActiveTextEditor(textEditor: Undefinable<TextEditor>) {
    // maintain versionLens.providerActive state
    // each time the active editor changes
    if (!textEditor) {
      // disable icons when no editor
      this.state.providerActive.value = false;
      return;
    }

    const providers = getDocumentProviders(textEditor.document, this.suggestionProviders);

    if (providers.length === 0) {
      // disable icons if no match found
      this.state.providerActive.value = false;
      return;
    }

    // ensure the latest logging level is set
    this.loggerChannel.refreshLoggingLevel();

    // update provider active state to enable icons
    this.state.providerActive.value = true;
  }

  async dispose() {
    this.disposable.dispose();
    this.logger.debug(`disposed ${TextEditorEvents.name}`);
  }

}