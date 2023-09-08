import { throwUndefinedOrNull } from '@esm-test/guards';
import { IDisposable } from 'domain/generics';
import { ILogger } from 'domain/logging';
import { ISuggestionProvider } from 'domain/suggestions';
import { AsyncEmitter } from 'domain/utils';
import { TextDocumentUtils } from 'presentation.extension';
import { Disposable, TextDocument, workspace } from 'vscode';

export type ProviderTextDocumentClosedEvent = (
  provider: ISuggestionProvider,
  packageFilePath: string
) => Promise<void>;

export class OnTextDocumentClose
  extends AsyncEmitter<ProviderTextDocumentClosedEvent>
  implements IDisposable {

  constructor(
    readonly suggestionProviders: Array<ISuggestionProvider>,
    readonly logger: ILogger
  ) {
    super();
    throwUndefinedOrNull("suggestionProviders", suggestionProviders);
    throwUndefinedOrNull("logger", logger);

    // register the vscode workspace event
    this.disposable = workspace.onDidCloseTextDocument(this.execute, this);
  }

  disposable: Disposable;

  async execute(document: TextDocument): Promise<void> {
    const provider = TextDocumentUtils.getDocumentProvider(
      document,
      this.suggestionProviders
    );

    provider && await this.fire(provider as ISuggestionProvider, document.uri.fsPath);
  }

  async dispose() {
    this.disposable.dispose();
    this.logger.debug(`disposed ${OnTextDocumentClose.name}`);
  }

}