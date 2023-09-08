import { throwUndefinedOrNull } from '@esm-test/guards';
import { IDisposable } from 'domain/generics';
import { ILogger } from 'domain/logging';
import { ISuggestionProvider } from 'domain/suggestions';
import { AsyncEmitter } from 'domain/utils';
import { Disposable, TextDocument, TextEditor, window } from 'vscode';
import { VersionLensState } from '../../state/versionLensState';
import { getDocumentProvider } from '../eventUtils';

export type ProviderEditorActivatedEvent = (
  activeProvider: ISuggestionProvider,
  document: TextDocument,
) => Promise<void>;

export class OnActiveTextEditorChange
  extends AsyncEmitter<ProviderEditorActivatedEvent>
  implements IDisposable {

  constructor(
    readonly state: VersionLensState,
    readonly suggestionProviders: Array<ISuggestionProvider>,
    readonly logger: ILogger
  ) {
    super();
    throwUndefinedOrNull("state", state);
    throwUndefinedOrNull("suggestionProviders", suggestionProviders);
    throwUndefinedOrNull("logger", logger);

    // register the vscode editor event
    this.disposable = window.onDidChangeActiveTextEditor(this.execute, this);
  }

  disposable: Disposable;

  /**
  * Maintains the versionLens.providerActive state
  * each time the active editor changes
  * @param textEditor
  * @returns
  */
  async execute(textEditor?: TextEditor): Promise<void> {
    if (!textEditor) {
      // disable icons when no editor
      this.state.providerActive.value = false;
      return;
    }

    // get the active providers
    const activeProvider = getDocumentProvider(textEditor.document, this.suggestionProviders);
    if (!activeProvider) {
      // disable icons if no matches found
      this.state.providerActive.value = false;
      return;
    }

    // update provider active state to show icons
    this.state.providerActive.value = true;

    // fire activated event
    await this.fire(activeProvider as ISuggestionProvider, textEditor.document);
  }

  async dispose() {
    this.disposable.dispose();
    this.logger.debug(`disposed ${OnActiveTextEditorChange.name}`);
  }

}