import { throwNull, throwUndefined } from '@esm-test/guards';
import { IDisposable } from 'domain/generics';
import { ILogger } from 'domain/logging';
import {
  PackageClientSourceType,
  PackageResponse
} from 'domain/packages';
import { IProvider, IProviderConfig } from 'domain/providers';
import {
  IPackageDependencyWatcher,
  ISuggestionProvider,
  SuggestionFlags,
  SuggestionStatus,
  defaultReplaceFn
} from 'domain/suggestions';
import { dirname } from 'node:path';
import {
  CommandFactory,
  SuggestionCodeLens,
  SuggestionCodeLensFactory,
  VersionLensExtension,
  VersionLensState
} from 'presentation.extension';
import * as VsCode from 'vscode';
import {
  CancellationToken,
  CodeLens,
  Event,
  EventEmitter,
  TextDocument,
  languages
} from 'vscode';

export class SuggestionCodeLensProvider
  implements VsCode.CodeLensProvider, IProvider, IDisposable {

  constructor(
    readonly extension: VersionLensExtension,
    readonly suggestionProvider: ISuggestionProvider,
    readonly packageDependencyWatcher: IPackageDependencyWatcher,
    readonly logger: ILogger
  ) {
    throwUndefined("extension", extension);
    throwNull("extension", extension);

    throwUndefined("suggestionProvider", suggestionProvider);
    throwNull("suggestionProvider", suggestionProvider);

    throwUndefined("packageDependencyWatcher", packageDependencyWatcher);
    throwNull("packageDependencyWatcher", packageDependencyWatcher);

    throwUndefined("logger", logger);
    throwNull("logger", logger);

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

  disposable: VsCode.Disposable

  get config(): IProviderConfig {
    return this.suggestionProvider.config;
  }

  get state(): VersionLensState {
    return this.extension.state;
  }

  reloadCodeLenses() {
    // notify vscode to refresh version lenses
    this.notifyCodeLensesChanged.fire();
  }

  async provideCodeLenses(
    document: TextDocument,
    token: CancellationToken
  ): Promise<Array<CodeLens>> {
    if (this.state.show.value === false) return [];

    // package path
    const packagePath = dirname(document.uri.fsPath);

    // get the project path from workspace path otherwise the current file
    const projectPath = this.extension.isWorkspaceMode
      ? this.extension.projectPath
      : dirname(packagePath);

    this.logger.info("Project path is %s", projectPath);

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

    // parse the document text dependencies
    const packageDeps = this.packageDependencyWatcher.updateDependencies(
      this.suggestionProvider.name,
      document.uri.fsPath,
      document.getText()
    );

    let suggestions: Array<PackageResponse> = [];
    try {
      suggestions = await this.suggestionProvider.fetchSuggestions(
        projectPath,
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
      return [];
    }

    this.logger.info(
      "Resolved %s %s package release and pre-release suggestions",
      suggestions.length,
      this.suggestionProvider.name
    );

    // remove prereleases if not enabled
    if (this.state.prereleasesEnabled.value === false) {
      suggestions = suggestions.filter(
        function (response) {
          const { suggestion } = response;
          return suggestion
            && (
              (suggestion.flags & SuggestionFlags.prerelease) === 0
              || suggestion.name.includes(SuggestionStatus.LatestIsPrerelease)
            );
        }
      )
    }

    // convert suggestions in to code lenses
    return SuggestionCodeLensFactory.createFromPackageResponses(
      document,
      suggestions,
      this.suggestionProvider.suggestionReplaceFn || defaultReplaceFn
    );
  }

  resolveCodeLens(codeLens: CodeLens, token: CancellationToken): CodeLens {
    if (codeLens instanceof SuggestionCodeLens) {
      // evaluate the code lens
      const evaluated = this.evaluateCodeLens(codeLens);

      // update the progress
      return evaluated;
    }

    return codeLens;
  }

  evaluateCodeLens(codeLens: SuggestionCodeLens) {
    if (codeLens.hasPackageSource(PackageClientSourceType.Directory))
      return CommandFactory.createDirectoryLinkCommand(codeLens);

    return CommandFactory.createSuggestedVersionCommand(codeLens)
  }

  async dispose() {
    this.disposable.dispose();
    const providerName = this.suggestionProvider.name;
    this.logger.debug(`disposed ${providerName} ${SuggestionCodeLensProvider.name}`);
  }

}