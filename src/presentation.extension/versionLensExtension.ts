import { IFrozenOptions } from 'domain/configuration';
import { VersionLensState } from "presentation.extension";
import { SuggestionsOptions } from "./suggestions/suggestionsOptions";

export class VersionLensExtension {

  constructor(
    appConfig: IFrozenOptions,
    projectPath: string,
    providerNames: string[]
  ) {
    this.config = appConfig;
    this.projectPath = projectPath;
    this.suggestions = new SuggestionsOptions(appConfig);
    // instantiate setContext options
    this.state = new VersionLensState(this, providerNames);
  }

  static extensionName: string = 'VersionLens';

  config: IFrozenOptions;

  projectPath: string;

  suggestions: SuggestionsOptions;

  state: VersionLensState;

}