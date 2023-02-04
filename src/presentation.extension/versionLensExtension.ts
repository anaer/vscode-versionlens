import { IFrozenOptions } from 'domain/configuration';
import { VersionLensState } from "presentation.extension";
import { SuggestionsOptions } from "./options/suggestionsOptions";

export class VersionLensExtension {

  static extensionName: string = 'VersionLens';

  config: IFrozenOptions;

  suggestions: SuggestionsOptions;

  state: VersionLensState;

  constructor(appConfig: IFrozenOptions, providerNames: string[]) {
    this.config = appConfig;
    this.suggestions = new SuggestionsOptions(appConfig);
    // instantiate setContext options
    this.state = new VersionLensState(this, providerNames);
  }

}