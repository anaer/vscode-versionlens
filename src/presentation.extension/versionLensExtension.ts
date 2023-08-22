import { throwNull, throwUndefined } from '@esm-test/guards';
import { IFrozenOptions } from 'domain/configuration';
import { VersionLensState } from "presentation.extension";
import { SuggestionsOptions } from "./suggestions/suggestionsOptions";

export class VersionLensExtension {

  constructor(appConfig: IFrozenOptions, projectPath: string) {
    throwUndefined("appConfig", appConfig);
    throwNull("appConfig", appConfig);

    throwUndefined("projectPath", <any>projectPath);
    throwNull("projectPath", <any>projectPath);

    this.config = appConfig;
    this.projectPath = projectPath;
    this.suggestions = new SuggestionsOptions(appConfig);

    // instantiate setContext options
    this.state = new VersionLensState(this);
  }

  static extensionName: string = 'VersionLens';

  config: IFrozenOptions;

  projectPath: string;

  suggestions: SuggestionsOptions;

  state: VersionLensState;

  /**
   * Checks if vscode is in workspace mode
   */
  get isWorkspaceMode() {
    return this.projectPath.length > 0;
  }

}