import { IConfig } from 'domain/configuration';
import { SuggestionContributions } from './definitions/eSuggestionContributions';

export class SuggestionsOptions {

  constructor(readonly config: IConfig) { }

  get showOnStartup(): boolean {
    return this.config.get<boolean>(
      SuggestionContributions.ShowOnStartup
    ) || false;
  }

  get showPrereleasesOnStartup(): boolean {
    return this.config.get<boolean>(
      SuggestionContributions.ShowPrereleasesOnStartup
    ) || false;
  }

}