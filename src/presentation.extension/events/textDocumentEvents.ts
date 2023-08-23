import { ICache, MemoryCache } from 'domain/caching';
import { ILogger } from 'domain/logging';
import { PackageDependency } from 'domain/packages';
import { SuggestionCodeLensProvider, TextDocumentUtils } from 'presentation.extension';
import { TextDocument, window, workspace } from 'vscode';
import { executeOnSaveChanges } from '../commands/executeOnSaveChanges';
import { throwNull, throwUndefined } from '@esm-test/guards';

export class TextDocumentEvents {

  constructor(
    readonly suggestionCodeLensProviders: Array<SuggestionCodeLensProvider>,
    readonly originalPackagesCache: ICache,
    readonly editPackagesCache: ICache,
    readonly logger: ILogger
  ) {
    throwUndefined("suggestionCodeLensProviders", suggestionCodeLensProviders);
    throwNull("suggestionCodeLensProviders", suggestionCodeLensProviders);

    throwUndefined("originalPackagesCache", originalPackagesCache);
    throwNull("originalPackagesCache", originalPackagesCache);

    throwUndefined("editPackagesCache", editPackagesCache);
    throwNull("editPackagesCache", editPackagesCache);

    throwUndefined("logger", logger);
    throwNull("logger", logger);

    // regsiter document events
    workspace.onDidOpenTextDocument(this.onDidOpenTextDocument, this);
    workspace.onDidSaveTextDocument(this.onDidSaveTextDocument, this);

    // ensure we fire for open document events after the extension is loaded
    window.visibleTextEditors.map(x => this.onDidOpenTextDocument(x.document));
  }

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

        // parse the document text dependencies
        const packageDeps = (<SuggestionCodeLensProvider>p).suggestionProvider.parseDependencies(
          packagePath,
          document.getText()
        );

        this.logger.debug(
          "Saving original parsed packages state for %s",
          document.uri.fsPath
        );

        // create the cache key
        const cacheKey = MemoryCache.createKey(p.config.providerName, packagePath);

        // save the opened state of the parsed packages
        this.originalPackagesCache.set<PackageDependency[]>(cacheKey, packageDeps);

        this.logger.debug(
          "Clearing the edited parsed packages state for %s",
          document.uri.fsPath
        );

        // clear the edited state of the parsed packages
        this.editPackagesCache.set<PackageDependency[]>(cacheKey, []);
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
        this.originalPackagesCache,
        this.editPackagesCache,
        this.logger
      )
    );
  }

}