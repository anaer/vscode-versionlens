import { throwUndefinedOrNull } from '@esm-test/guards';
import { ISuggestionProvider } from 'domain/providers';
import { minimatch } from 'minimatch';
import { basename } from 'node:path';

export class GetSuggestionProvider {

  constructor(private readonly suggestionProviders: Array<ISuggestionProvider>) {
    throwUndefinedOrNull("suggestionProviders", suggestionProviders);
  }

  execute(filePath: string): ISuggestionProvider {
    const filename = basename(filePath);

    const filtered = this.suggestionProviders
      .filter(
        provider => minimatch(filename, provider.config.fileMatcher.pattern)
      )
      .filter(
        provider => !minimatch(filePath, provider.config.fileMatcher.exclude)
      );

    if (filtered.length === 0) return;

    return filtered[0];
  }

}