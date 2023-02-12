import { IConfig } from 'domain/configuration';
import { SuggestionContributions } from './eSuggestionContributions';

export class SuggestionsOptions {

  private config: IConfig;

  constructor(config: IConfig) {
    this.config = config;
  }

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