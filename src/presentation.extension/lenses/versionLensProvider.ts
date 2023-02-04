import { ILogger } from 'domain/logging';
import { PackageResponse, PackageSourceType } from 'domain/packages';
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
import {
  CancellationToken,
  CodeLens,
  CodeLensProvider,
  DocumentSelector,
  Event,
  EventEmitter,
  TextDocument
} from 'vscode';

export class VersionLensProvider implements CodeLensProvider, IProvider {

  constructor(
    extension: VersionLensExtension,
    suggestionProvider: ISuggestionProvider,
    logger: ILogger
  ) {
    this.extension = extension;
    this.suggestionProvider = suggestionProvider;
    this.logger = logger;

    this.notifyCodeLensesChanged = new EventEmitter();
    this.onDidChangeCodeLenses = this.notifyCodeLensesChanged.event;
  }

  notifyCodeLensesChanged: EventEmitter<void>;

  onDidChangeCodeLenses: Event<void>;

  extension: VersionLensExtension;

  suggestionProvider: ISuggestionProvider;

  logger: ILogger;

  get config(): IProviderConfig {
    return this.suggestionProvider.config;
  }

  get state(): VersionLensState {
    return this.extension.state;
  }

  get documentSelector(): DocumentSelector {
    return this.suggestionProvider.config.fileMatcher;
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
    if (this.state.enabled.value === false) return null;

    // @ts-ignore
    // get the opened state
    const documentOpened = this.suggestionProvider.opened;

    // @ts-ignore
    // reset opened state
    this.suggestionProvider.opened = false;

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
      suggestions = await this.suggestionProvider.fetchSuggestions(
        packagePath,
        packageDeps
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
    if (codeLens.hasPackageSource(PackageSourceType.Directory))
      return CommandFactory.createDirectoryLinkCommand(codeLens);

    return CommandFactory.createSuggestedVersionCommand(codeLens)
  }

}