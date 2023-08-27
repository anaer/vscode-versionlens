import { throwNull, throwUndefined } from '@esm-test/guards';
import { IDisposable, Undefinable } from 'domain/generics';
import { ILogger } from 'domain/logging';
import { ISuggestionProvider } from 'domain/suggestions';
import { Disposable, TextDocument, TextEditor, window } from 'vscode';
import { VersionLensState } from '../state/versionLensState';
import { getDocumentProviders } from './eventUtils';

export type ProviderEditorActivatedEvent = (
  activeProviders: ISuggestionProvider[],
  document: TextDocument,
) => void;

export class OnActiveTextEditorChange implements IDisposable {

  constructor(
    readonly state: VersionLensState,
    readonly suggestionProviders: Array<ISuggestionProvider>,
    readonly logger: ILogger
  ) {
    throwUndefined("state", state);
    throwNull("state", state);

    throwUndefined("suggestionProviders", suggestionProviders);
    throwNull("suggestionProviders", suggestionProviders);

    throwUndefined("logger", logger);
    throwNull("logger", logger);

    // register the vscode editor event
    this.disposable = window.onDidChangeActiveTextEditor(this.execute, this);
  }

  disposable: Disposable;

  listener: ProviderEditorActivatedEvent;

  registerListener(listener: ProviderEditorActivatedEvent, thisArg: any) {
    this.listener = listener.bind(thisArg);
  }

  /**
  * Maintains the versionLens.providerActive state
  * each time the active editor changes
  * @param textEditor
  * @returns
  */
  execute(textEditor: Undefinable<TextEditor>) {
    if (!textEditor) {
      // disable icons when no editor
      this.state.providerActive.value = false;
      return;
    }

    // get the active providers
    const activeProviders = getDocumentProviders(textEditor.document, this.suggestionProviders);
    if (activeProviders.length === 0) {
      // disable icons if no matches found
      this.state.providerActive.value = false;
      return;
    }

    // update provider active state to show icons
    this.state.providerActive.value = true;

    // execute provider activated event
    this.listener && this.listener(
      activeProviders as ISuggestionProvider[],
      textEditor.document
    );
  }

  async dispose() {
    this.disposable.dispose();
    this.logger.debug(`disposed ${OnActiveTextEditorChange.name}`);
  }

}