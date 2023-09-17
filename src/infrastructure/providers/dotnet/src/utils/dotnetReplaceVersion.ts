import { TSuggestionUpdate, defaultReplaceFn } from "domain/suggestions";
import { noVersionAttr } from "../parser/dotnetParserTypeFactory";

export function dotnetReplaceVersion(suggestionUpdate: TSuggestionUpdate, newVersion: string): string {

  return defaultReplaceFn(
    suggestionUpdate,
    // handle cases with blank version attr entries
    suggestionUpdate.parsedVersion === noVersionAttr ?
      `Version="${newVersion}" ` :
      newVersion
  );

}