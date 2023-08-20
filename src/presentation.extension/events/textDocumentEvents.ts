import { ILogger } from 'domain/logging';
import { SuggestionCodeLensProvider, TextDocumentUtils } from 'presentation.extension';
import { TextDocument, window, workspace } from 'vscode';
import { executeOnSaveChanges } from '../commands/executeOnSaveChanges';
import { VersionLensState } from '../state/versionLensState';

export class TextDocumentEvents {

  constructor(
    state: VersionLensState,
    suggestionCodeLensProviders: Array<SuggestionCodeLensProvider>,
    logger: ILogger
  ) {
    this.state = state;
    this.suggestionCodeLensProviders = suggestionCodeLensProviders;
    this.logger = logger;

    // regsiter document events
    workspace.onDidOpenTextDocument(this.onDidOpenTextDocument, this);
    workspace.onDidSaveTextDocument(this.onDidSaveTextDocument, this);

    // ensure we fire for open document events after the extension is loaded
    window.visibleTextEditors.map(x => this.onDidOpenTextDocument(x.document));
  }

  state: VersionLensState;

  suggestionCodeLensProviders: Array<SuggestionCodeLensProvider>;

  logger: ILogger;

  onDidOpenTextDocument(document: TextDocument) {
    const matchedProviders = TextDocumentUtils.getDocumentProviders(
      document,
      this.suggestionCodeLensProviders
    )

    if (matchedProviders.length === 0) return;

    const packagePath = document.uri.path;

    matchedProviders.forEach(
      p => {
        this.logger.debug(
          "[onDidOpenTextDocument] %s provider matched %s",
          p.config.providerName,
          packagePath
        );

        this.state.setOriginalParsedPackages(
          p.config.providerName,
          packagePath,
          []
        );

        this.state.setRecentParsedPackages(
          p.config.providerName,
          packagePath,
          []
        );

        this.state.providerOpened.change(true);
      }
    );
  }

  onDidSaveTextDocument(document: TextDocument) {
    const filteredProviders = TextDocumentUtils.getDocumentProviders(
      document,
      this.suggestionCodeLensProviders
    );

    if (filteredProviders.length === 0) return;

    const packagePath = document.uri.path;

    filteredProviders.forEach(
      async provider => await executeOnSaveChanges(
        provider,
        packagePath,
        this.state,
        this.logger
      )
    );
  }

}