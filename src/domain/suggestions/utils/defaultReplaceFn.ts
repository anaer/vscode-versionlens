import { VersionUtils } from 'domain/packages';
import { TSuggestionUpdate } from 'domain/suggestions';

export function defaultReplaceFn(suggestionUpdate: TSuggestionUpdate, newVersion: string): string {
  return VersionUtils.formatWithExistingLeading(
    suggestionUpdate.parsedVersion,
    newVersion
  );
}