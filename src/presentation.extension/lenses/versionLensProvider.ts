import { IDispose } from 'domain/generics';
import { ILogger } from 'domain/logging';
import { PackageClientSourceType, PackageResponse } from 'domain/packages';
import { IProvider, IProviderConfig } from 'domain/providers';
import {
  defaultReplaceFn,
  ISuggestionProvider,
  SuggestionFlags,
  SuggestionStatus
} from 'domain/suggestions';
import { dirname } from 'path';
import {
  CommandFactory,
  VersionLens,
  VersionLensExtension,
  VersionLensFactory,
  VersionLensState
} from 'presentation.extension';
import * as VsCode from 'vscode';
import {
  CancellationToken,
  CodeLens,
  Event,
  EventEmitter,
  languages,
  TextDocument
} from 'vscode';

export class VersionLensProvider
  implements VsCode.CodeLensProvider, IProvider, IDispose {

  constructor(
    extension: VersionLensExtension,
    suggestionProvider: ISuggestionProvider,
    logger: ILogger
  ) {
    this.extension = extension;
    this.suggestionProvider = suggestionProvider;
    this.logger = logger;

    // register changed event before registering the codelens
    this.notifyCodeLensesChanged = new EventEmitter();
    this.onDidChangeCodeLenses = this.notifyCodeLensesChanged.event;

    // register the codelens provider with vscode
    this.disposable = languages.registerCodeLensProvider(
      suggestionProvider.config.fileMatcher,
      this
    );
  }

  notifyCodeLensesChanged: EventEmitter<void>;

  onDidChangeCodeLenses: Event<void>;

  extension: VersionLensExtension;

  suggestionProvider: ISuggestionProvider;

  logger: ILogger;

  disposable: VsCode.Disposable

  get config(): IProviderConfig {
    return this.suggestionProvider.config;
  }

  get state(): VersionLensState {
    return this.extension.state;
  }

  reloadCodeLenses() {
    // clear the cache
    this.suggestionProvider.clearCache();
    // notify vscode to refresh version lenses
    this.notifyCodeLensesChanged.fire();
  }

  async provideCodeLenses(
    document: TextDocument,
    token: CancellationToken
  ): Promise<Array<CodeLens>> {
    if (this.state.show.value === false) return null;

    // get the opened state
    const documentOpened = this.state.providerOpened.value;

    // reset opened state
    this.state.providerOpened.change(false);

    // package path
    const packagePath = dirname(document.uri.fsPath);

    // clear any errors
    this.state.providerError.value = false;

    // set in progress
    this.state.providerBusy.value++;

    // unfreeze config per file request
    this.config.caching.defrost();

    this.logger.info(
      "Caching duration is set to %s seconds",
      this.config.caching.duration / 1000
    );

    this.logger.info(
      "Analysing %s dependencies in %s",
      this.suggestionProvider.name,
      document.uri.fsPath
    );

    // parse the document text dependencies
    const packageDeps = this.suggestionProvider.parseDependencies(
      packagePath,
      document.getText()
    );

    // check if the document was just opened
    if (documentOpened) {
      this.logger.debug(
        "%s provider opened. Saving original state",
        this.suggestionProvider.name
      );

      // store the originally fetched dependencies
      this.state.setOriginalParsedPackages(
        this.suggestionProvider.name,
        document.uri.path,
        packageDeps
      );
    }

    // store the recently fetched dependencies
    this.state.setRecentParsedPackages(
      this.suggestionProvider.name,
      document.uri.path,
      packageDeps
    );

    let suggestions: Array<PackageResponse> = [];
    try {
      const startedAt = performance.now();

      suggestions = await this.suggestionProvider.fetchSuggestions(
        packagePath,
        packageDeps
      );

      const completedAt = performance.now();
      this.logger.info(
        'All packages fetched for %s (%s ms)',
        this.suggestionProvider.name,
        Math.floor(completedAt - startedAt)
      );

    } catch (error) {
      this.state.providerError.value = true;
      this.state.providerBusy.change(0)
      return Promise.reject(error);
    }

    this.state.providerBusy.value--;

    if (suggestions === null) {
      this.logger.info(
        "No %s suggestions found in %s",
        this.suggestionProvider.name,
        document.uri.fsPath
      );
      return null;
    }

    this.logger.info(
      "Resolved %s %s package release and pre-release suggestions",
      suggestions.length,
      this.suggestionProvider.name
    );

    if (this.state.prereleasesEnabled.value === false) {
      suggestions = suggestions.filter(
        function (response) {
          const { suggestion } = response;
          return (suggestion.flags & SuggestionFlags.prerelease) === 0 ||
            suggestion.name.includes(SuggestionStatus.LatestIsPrerelease);
        }
      )
    }

    // convert suggestions in to code lenses
    return VersionLensFactory.createFromPackageResponses(
      document,
      suggestions,
      this.suggestionProvider.suggestionReplaceFn || defaultReplaceFn
    );
  }

  resolveCodeLens(codeLens: CodeLens, token: CancellationToken): CodeLens {
    if (codeLens instanceof VersionLens) {
      // evaluate the code lens
      const evaluated = this.evaluateCodeLens(codeLens);

      // update the progress
      return evaluated;
    }
  }

  evaluateCodeLens(codeLens: VersionLens) {
    if (codeLens.hasPackageSource(PackageClientSourceType.Directory))
      return CommandFactory.createDirectoryLinkCommand(codeLens);

    return CommandFactory.createSuggestedVersionCommand(codeLens)
  }

  dispose() {
    this.disposable.dispose();
    const providerName = this.suggestionProvider.name;
    this.logger.debug(`disposed ${providerName} ${VersionLensProvider.name}`);
  }

}