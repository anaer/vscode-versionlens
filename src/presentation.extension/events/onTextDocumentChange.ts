import { throwUndefinedOrNull } from '@esm-test/guards';
import { ILogger } from 'domain/logging';
import { ISuggestionProvider } from 'domain/suggestions';
import { TextDocumentUtils } from 'presentation.extension';
import { TextDocumentChangeEvent, workspace } from 'vscode';

export type ProviderTextDocumentChange = (
  providers: ISuggestionProvider[],
  packageFilePath: string,
  newContent: string
) => void;

export class OnTextDocumentChange {

  constructor(
    readonly suggestionProviders: Array<ISuggestionProvider>,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("suggestionProviders", suggestionProviders);
    throwUndefinedOrNull("logger", logger);

    // register the vscode workspace event
    workspace.onDidChangeTextDocument(this.execute, this);
  }

  listener: ProviderTextDocumentChange;

  registerListener(listener: ProviderTextDocumentChange, thisArg: any) {
    this.listener = listener.bind(thisArg);
  }

  execute(e: TextDocumentChangeEvent) {
    const providers = TextDocumentUtils.getDocumentProviders(
      e.document,
      this.suggestionProviders
    );
    if (providers.length === 0) return;

    this.listener && this.listener(
      providers as ISuggestionProvider[],
      e.document.uri.fsPath,
      e.document.getText()
    );
  }

}
