import { IProvider, getProvidersByFileName } from "domain/providers";
import { SuggestionCodeLensProvider } from "presentation.extension";
import { TextDocument, window } from "vscode";

export function getDocumentProviders(
  document: TextDocument,
  suggestionProviders: IProvider[]
): IProvider[] {

  if (document.uri.scheme !== 'file') return [];

  const providers = getProvidersByFileName(document.fileName, suggestionProviders);

  if (providers.length === 0) return [];

  return providers;
}

export function refreshActiveCodeLenses(codeLensProviders: SuggestionCodeLensProvider[]) {
  if (!window.activeTextEditor) return;

  const fileName = window.activeTextEditor.document.fileName;
  const providers = getProvidersByFileName(fileName, codeLensProviders);
  if (!providers) return false;

  providers.forEach(provider => provider.reloadCodeLenses());

  return true;
}