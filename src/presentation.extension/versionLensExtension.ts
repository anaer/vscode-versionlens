import { IFrozenOptions } from 'domain/configuration';
import { VersionLensState } from "presentation.extension";
import { SuggestionsOptions } from "./options/suggestionsOptions";

export class VersionLensExtension {

  static extensionName: string = 'VersionLens';

  config: IFrozenOptions;

  suggestions: SuggestionsOptions;

  state: VersionLensState;

  constructor(rootConfig: IFrozenOptions) {
    this.config = rootConfig;
    this.suggestions = new SuggestionsOptions(rootConfig);
    // instantiate setContext options
    this.state = new VersionLensState(this);
  }

}