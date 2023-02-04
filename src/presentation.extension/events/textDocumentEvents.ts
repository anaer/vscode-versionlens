import { hasPackageDepsChanged } from 'application/packages';
import { ILogger } from 'domain/logging';
import { ISuggestionProvider } from 'domain/suggestions';
import { TextDocumentUtils } from 'presentation.extension';
import { commands, TextDocument, window, workspace } from 'vscode';
import { VersionLensState } from '../state/versionLensState';

export class TextDocumentEvents {

  constructor(
    state: VersionLensState,
    suggestionProviders: Array<ISuggestionProvider>,
    logger: ILogger
  ) {
    this.state = state;
    this.suggestionProviders = suggestionProviders;
    this.logger = logger;

    // regsiter document events
    workspace.onDidOpenTextDocument(this.onDidOpenTextDocument, this);
    workspace.onDidSaveTextDocument(this.onDidSaveTextDocument, this);

    // ensure we fire for open document events after the extension is loaded
    window.visibleTextEditors.map(x => this.onDidOpenTextDocument(x.document));
  }

  state: VersionLensState;

  suggestionProviders: Array<ISuggestionProvider>;

  logger: ILogger;

  onDidOpenTextDocument(document: TextDocument) {
    const providers = TextDocumentUtils.getDocumentSuggestionProviders(
      document,
      this.suggestionProviders
    )

    if (providers.length === 0) return;

    const packagePath = document.uri.path;

    providers.forEach(
      p => {
        this.logger.debug(
          "Provider opened %s %s",
          p.name,
          packagePath
        );

        this.state.setOriginalParsedPackages(
          p.name,
          packagePath,
          []
        );

        this.state.setRecentParsedPackages(
          p.name,
          packagePath,
          []
        );

        // @ts-ignore
        p.opened = true;
      }
    );

  }

  onDidSaveTextDocument(document: TextDocument) {
    const providers = TextDocumentUtils.getDocumentSuggestionProviders(
      document,
      this.suggestionProviders
    )

    if (providers.length === 0) return;

    const packagePath = document.uri.path;

    providers.forEach(
      p => {
        // ensure we have a task to run
        if (p.config.onSaveChangesTask.length === 0) return;

        // get the original and recent parsed packages
        const original = this.state.getOriginalParsedPackages(p.name, packagePath);
        const recent = this.state.getRecentParsedPackages(p.name, packagePath);

        // test if anything has changed
        if (hasPackageDepsChanged(original, recent)) {

          // set original to recent
          this.state.setOriginalParsedPackages(p.name, packagePath, recent)

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