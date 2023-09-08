import { throwUndefinedOrNull } from '@esm-test/guards';
import { ILogger } from 'domain/logging';
import {
  PackageResponse,
  PackageSourceType
} from 'domain/packages';
import { IProvider, IProviderConfig } from 'domain/providers';
import {
  GetSuggestions,
  ISuggestionProvider,
  SuggestionStatus,
  SuggestionTypes,
  defaultReplaceFn
} from 'domain/suggestions';
import { IDisposable } from 'domain/utils';
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
    readonly getSuggestions: GetSuggestions,
    readonly logger: ILogger
  ) {
    throwUndefinedOrNull("extension", extension);
    throwUndefinedOrNull("suggestionProvider", suggestionProvider);
    throwUndefinedOrNull("getSuggestions", getSuggestions);
    throwUndefinedOrNull("logger", logger);

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

  async provideCodeLenses(document: TextDocument, token: CancellationToken): Promise<CodeLens[]> {
    if (this.state.show.value === false) return [];

    const packageFilePath = document.uri.fsPath;
    const packagePath = dirname(packageFilePath);

    // get the project path from workspace path otherwise the current file
    const projectPath = this.extension.isWorkspaceMode
      ? this.extension.projectPath
      : packagePath;

    this.logger.info("Project path is %s", projectPath);

    // clear any errors
    this.state.providerError.value = false;

    // set in progress
    this.state.providerBusy.value++;

    // fetch the package suggestions
    let suggestions: Array<PackageResponse> = [];
    try {
      suggestions = await this.getSuggestions.execute(
        this.suggestionProvider,
        projectPath,
        packageFilePath
      );
    } catch (error) {
      this.state.providerError.value = true;
      this.state.providerBusy.change(0)
      return Promise.reject(error);
    }

    this.state.providerBusy.value--;

    // remove prereleases if not enabled
    if (this.state.showPrereleases.value === false) {
      suggestions = suggestions.filter(
        function (response) {
          const { suggestion } = response;
          return suggestion
            && (
              (suggestion.type & SuggestionTypes.prerelease) === 0
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
    if (codeLens.hasPackageSource(PackageSourceType.Directory))
      return CommandFactory.createDirectoryLinkCommand(codeLens);

    return CommandFactory.createSuggestedVersionCommand(codeLens)
  }

  async dispose() {
    this.disposable.dispose();
    const providerName = this.suggestionProvider.name;
    this.logger.debug(`disposed ${providerName} ${SuggestionCodeLensProvider.name}`);
  }

}