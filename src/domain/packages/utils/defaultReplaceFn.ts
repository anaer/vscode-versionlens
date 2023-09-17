import { TSuggestionUpdate, VersionUtils } from 'domain/packages';

export function defaultReplaceFn(suggestionUpdate: TSuggestionUpdate, newVersion: string): string {
  return VersionUtils.formatWithExistingLeading(
    suggestionUpdate.parsedVersion,
    newVersion
  );
}