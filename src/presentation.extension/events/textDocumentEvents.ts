import { hasPackageDepsChanged } from 'application/packages';
import { ILogger } from 'domain/logging';
import { TextDocumentUtils, VersionLensProvider } from 'presentation.extension';
import { commands, TextDocument, window, workspace } from 'vscode';
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
      p => {
        // ensure we have a task to run
        if (p.config.onSaveChangesTask.length === 0) return;

        // get the original and recent parsed packages
        const original = this.state.getOriginalParsedPackages(
          p.config.providerName,
          packagePath
        );

        const recent = this.state.getRecentParsedPackages(
          p.config.providerName,
          packagePath
        );

        // test if anything has changed
        if (hasPackageDepsChanged(original, recent)) {

          // set original to recent
          this.state.setOriginalParsedPackages(
            p.config.providerName,
            packagePath,
            recent
          );

          // run the custom task for the provider
          commands.executeCommand(
            "workbench.action.tasks.runTask",
            p.config.onSaveChangesTask
          );
        }
      }
    );

  }

}