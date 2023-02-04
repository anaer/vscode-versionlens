import { getSuggestionProvidersByFileName } from "application/providers";
import { ISuggestionProvider } from "domain/suggestions";
import { TextDocument } from "vscode";

export function getDocumentSuggestionProviders(
  document: TextDocument,
  suggestionProviders: ISuggestionProvider[]
): ISuggestionProvider[] {

  if (document.uri.scheme !== 'file') return [];

  const providers = getSuggestionProvidersByFileName(
    document.fileName,
    suggestionProviders
  );

  if (providers.length === 0) return [];

  return providers;
}