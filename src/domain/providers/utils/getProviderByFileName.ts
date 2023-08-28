import { IProvider } from "domain/providers";
import { minimatch } from 'minimatch';
import { basename } from 'node:path';

export function getProviderByFileName<T extends IProvider>(
  fileName: string,
  providers: Array<T>
): T {

  const filename = basename(fileName);

  const filtered = providers.filter(
    provider => minimatch(filename, provider.config.fileMatcher.pattern)
  );

  if (filtered.length === 0) return;

  return filtered[0];
}