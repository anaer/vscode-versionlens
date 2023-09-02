import { throwUndefinedOrNull } from '@esm-test/guards';
import { IDisposable } from 'domain/generics';
import { ILogger } from 'domain/logging';
import { ISuggestionProvider } from 'domain/suggestions';
import { TextDocumentUtils } from 'presentation.extension';
import { Disposable, TextDocumentChangeEvent, workspace } from 'vscode';

export type ProviderTextDocumentChangeFunction = (
  provider: ISuggestionProvider,
  packageFilePath: string,
  newContent: string
) => void;

export class OnTextDocumentChange implements IDisposable {

  constructor(
    readonly suggestionProviders: Array<ISuggestionProvider>,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("suggestionProviders", suggestionProviders);
    throwUndefinedOrNull("logger", logger);

    // register the vscode workspace event
    this.disposable = workspace.onDidChangeTextDocument(this.execute, this);
  }

  disposable: Disposable;

  listener: ProviderTextDocumentChangeFunction;

  registerListener(listener: ProviderTextDocumentChangeFunction, thisArg: any) {
    this.listener = listener.bind(thisArg);
  }

  execute(e: TextDocumentChangeEvent) {
    if (e.contentChanges.length == 0) return;

    const provider = TextDocumentUtils.getDocumentProvider(
      e.document,
      this.suggestionProviders
    );

    if (!provider) return;

    this.listener && this.listener(
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
