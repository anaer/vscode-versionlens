import { throwUndefinedOrNull } from '@esm-test/guards';
import { ILogger } from 'domain/logging';
import { ISuggestionProvider } from 'domain/suggestions';
import { GetSuggestionProvider } from 'domain/useCases';
import { AsyncEmitter, IDisposable } from 'domain/utils';
import { VersionLensState } from 'presentation.extension';
import { Disposable, TextDocument, workspace } from 'vscode';

export type ProviderTextDocumentSaveEvent = (
  provider: ISuggestionProvider,
  packageFilePath: string,
) => Promise<void>;

export class OnTextDocumentSave
  extends AsyncEmitter<ProviderTextDocumentSaveEvent>
  implements IDisposable {

  constructor(
    readonly getSuggestionProvider: GetSuggestionProvider,
    readonly state: VersionLensState,
    readonly logger: ILogger
  ) {
    super();
    throwUndefinedOrNull("getSuggestionProvider", getSuggestionProvider);
    throwUndefinedOrNull("state", state)
    throwUndefinedOrNull("logger", logger);

    // register the vscode workspace event
    this.disposable = workspace.onDidSaveTextDocument(this.execute, this);
  }

  disposable: Disposable;

  async execute(document: TextDocument): Promise<void> {
    // ensure we have an active provider
    if (!this.state.providerActive.value) return;

    // get the provider
    const provider = this.getSuggestionProvider.execute(document.fileName);
    if (!provider) return;

    if (this.state.showOutdated.value) {
      await this.fire(provider as ISuggestionProvider, document.uri.fsPath);

      // reset outdated flag
      await this.state.showOutdated.change(false);
    }
  }

  async dispose() {
    this.disposable.dispose();
    this.logger.debug(`disposed ${OnTextDocumentSave.name}`);
  }

}