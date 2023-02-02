import minimatch from 'minimatch';
import { basename } from 'path';
import { IProvider } from "../../domain/providers";

export function getSuggestionProvidersByFileName<T extends IProvider>(
  fileName: string,
  providers: Array<T>
): Array<T> {

  const filename = basename(fileName);

  const filtered = providers.filter(
    provider => minimatch(filename, provider.config.fileMatcher.pattern)
  );

  if (filtered.length === 0) return [];

  return filtered;
}