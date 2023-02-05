import { ILogger } from 'domain/logging';
import { TextDocumentUtils, VersionLensProvider } from 'presentation.extension';
import { TextDocument, window, workspace } from 'vscode';
import { executeOnSaveChanges } from '../commands/executeOnSaveChanges';
import { VersionLensState } from '../state/versionLensState';

export class TextDocumentEvents {

  constructor(
    state: VersionLensState,
    versionLensProviders: Array<VersionLensProvider>,
    logger: ILogger
  ) {
    this.state = state;
    this.versionLensProviders = versionLensProviders;
    this.logger = logger;

    // regsiter document events
    workspace.onDidOpenTextDocument(this.onDidOpenTextDocument, this);
    workspace.onDidSaveTextDocument(this.onDidSaveTextDocument, this);

    // ensure we fire for open document events after the extension is loaded
    window.visibleTextEditors.map(x => this.onDidOpenTextDocument(x.document));
  }

  state: VersionLensState;

  versionLensProviders: Array<VersionLensProvider>;

  logger: ILogger;

  onDidOpenTextDocument(document: TextDocument) {
    const matchedProviders = TextDocumentUtils.getDocumentProviders(
      document,
      this.versionLensProviders
    )

    if (matchedProviders.length === 0) return;

    const packagePath = document.uri.path;

    matchedProviders.forEach(
      p => {
        this.logger.debug(
          "Provider opened %s %s",
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

        (<VersionLensProvider>p).opened = true;
      }
    );
  }

  onDidSaveTextDocument(document: TextDocument) {
    const providers = TextDocumentUtils.getDocumentProviders(
      document,
      this.versionLensProviders
    )

    if (providers.length === 0) return;

    const packagePath = document.uri.path;

    providers.forEach(
      async provider => await executeOnSaveChanges(
        provider,
        packagePath,
        this.state,
        this.logger
      )
    );
  }

}