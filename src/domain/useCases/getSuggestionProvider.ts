import { throwUndefinedOrNull } from "@esm-test/guards";
import { ISuggestionProvider } from "domain/suggestions";
import { minimatch } from 'minimatch';
import { basename } from 'node:path';

export class GetSuggestionProvider {

  constructor(private readonly suggestionProviders: Array<ISuggestionProvider>) {
    throwUndefinedOrNull("suggestionProviders", suggestionProviders);
  }

  execute(fileName: string): ISuggestionProvider {
    const filename = basename(fileName);

    const filtered = this.suggestionProviders.filter(
      provider => minimatch(filename, provider.config.fileMatcher.pattern)
    );

    if (filtered.length === 0) return;

    return filtered[0];
  }

}