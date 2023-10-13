import { throwUndefinedOrNull } from '@esm-test/guards';
import { ISuggestionProvider } from 'domain/providers';
import { isMatch } from 'micromatch';
import { basename } from 'node:path';

export class GetSuggestionProvider {

  constructor(private readonly suggestionProviders: Array<ISuggestionProvider>) {
    throwUndefinedOrNull("suggestionProviders", suggestionProviders);
  }

  execute(filePath: string): ISuggestionProvider {
    const filename = basename(filePath);

    let filtered = this.suggestionProviders
      .filter(
        provider => isMatch(filename, provider.config.fileMatcher.pattern)
      )
      .filter(
        provider => !(
          provider.config.fileMatcher.exclude &&
          isMatch(filePath, provider.config.fileMatcher.exclude)
        )
      );

    if (filtered.length === 0) return;

    return filtered[0];
  }

}