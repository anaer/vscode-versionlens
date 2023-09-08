import { throwUndefinedOrNull } from '@esm-test/guards';
import { IDisposable } from 'domain/generics';
import { ILogger } from 'domain/logging';
import { ISuggestionProvider } from 'domain/suggestions';
import { AsyncEmitter } from 'domain/utils';
import { TextDocumentUtils } from 'presentation.extension';
import { Disposable, TextDocumentChangeEvent, TextDocumentChangeReason, workspace } from 'vscode';

export type ProviderTextDocumentChangeEvent = (
  provider: ISuggestionProvider,
  packageFilePath: string,
  newContent: string
) => Promise<void>;

export class OnTextDocumentChange
  extends AsyncEmitter<ProviderTextDocumentChangeEvent>
  implements IDisposable {

  constructor(
    readonly suggestionProviders: Array<ISuggestionProvider>,
    readonly logger: ILogger
  ) {
    super();
    throwUndefinedOrNull("suggestionProviders", suggestionProviders);
    throwUndefinedOrNull("logger", logger);

    // register the vscode workspace event
    this.disposable = workspace.onDidChangeTextDocument(this.execute, this);
  }

  disposable: Disposable;

  async execute(e: TextDocumentChangeEvent): Promise<void> {
    // check if we have a change
    const shouldHandleEvent = e.reason == TextDocumentChangeReason.Redo
      || e.reason == TextDocumentChangeReason.Undo
      || e.contentChanges.length > 0

    if (shouldHandleEvent == false) return;

    // check a provider handles this document
    const provider = TextDocumentUtils.getDocumentProvider(
      e.document,
      this.suggestionProviders
    );

    if (!provider) return;

    // execute the listener
    await this.fire(
      provider as ISuggestionProvider,
      e.document.uri.fsPath,
      e.document.getText()
    );
  }

  async dispose() {
    this.disposable.dispose();
    this.logger.debug(`disposed ${OnTextDocumentChange.name}`);
  }

}
