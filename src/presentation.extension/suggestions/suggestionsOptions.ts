import { throwUndefinedOrNull } from '@esm-test/guards';
import { IConfig } from 'domain/configuration';
import { SuggestionContributions } from './definitions/eSuggestionContributions';
import { KeyDictionary } from 'domain/utils';

export class SuggestionsOptions {

  constructor(readonly config: IConfig) {
    throwUndefinedOrNull("config", config);
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

  get indicators(): KeyDictionary<string> {
    return this.config.get<KeyDictionary<string>>(
      SuggestionContributions.Indicators
    );
  }

}