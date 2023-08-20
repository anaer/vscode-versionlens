import { IProvider, getProvidersByFileName } from "domain/providers";
import { TextDocument } from "vscode";

export function getDocumentProviders(
  document: TextDocument,
  suggestionProviders: IProvider[]
): IProvider[] {

  if (document.uri.scheme !== 'file') return [];

  const providers = getProvidersByFileName(
    document.fileName,
    suggestionProviders
  );

  if (providers.length === 0) return [];

  return providers;
}