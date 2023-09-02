import { throwUndefinedOrNull } from '@esm-test/guards';
import { ILogger } from 'domain/logging';
import { ISuggestionProvider } from 'domain/suggestions';
import { TextDocumentUtils } from 'presentation.extension';
import { Disposable, TextDocument, workspace } from 'vscode';

export type ProviderTextDocumentClosedFunction = (
  provider: ISuggestionProvider,
  packageFilePath: string
) => void;

export class OnTextDocumentClose {

  constructor(
    readonly suggestionProviders: Array<ISuggestionProvider>,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("suggestionProviders", suggestionProviders);
    throwUndefinedOrNull("logger", logger);

    // register the vscode workspace event
    this.disposable = workspace.onDidCloseTextDocument(this.execute, this);
  }

  disposable: Disposable;

  listener: ProviderTextDocumentClosedFunction;

  registerListener(listener: ProviderTextDocumentClosedFunction, thisArg: any) {
    this.listener = listener.bind(thisArg);
  }

  execute(document: TextDocument) {
    const provider = TextDocumentUtils.getDocumentProvider(
      document,
      this.suggestionProviders
    );

    provider && this.listener && this.listener(provider as ISuggestionProvider, document.uri.fsPath);
  }

  async dispose() {
    this.disposable.dispose();
    this.logger.debug(`disposed ${OnTextDocumentClose.name}`);
  }

}