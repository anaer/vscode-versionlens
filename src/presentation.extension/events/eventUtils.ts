import { IProvider, getProviderByFileName } from "domain/providers";
import { SuggestionCodeLensProvider } from "presentation.extension";
import { TextDocument, window } from "vscode";

export function getDocumentProvider(
  document: TextDocument,
  suggestionProviders: IProvider[]
): IProvider {
  if (document.uri.scheme !== 'file') return;
  const provider = getProviderByFileName(document.fileName, suggestionProviders);
  return provider;
}

export function refreshActiveCodeLenses(codeLensProviders: SuggestionCodeLensProvider[]): void {
  if (!window.activeTextEditor) return;
  const fileName = window.activeTextEditor.document.fileName;
  const provider = getProviderByFileName(fileName, codeLensProviders);
  provider && provider.reloadCodeLenses();
}