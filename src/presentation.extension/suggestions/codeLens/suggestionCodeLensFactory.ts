import { PackageResponse, TSuggestionReplaceFunction } from 'domain/packages';
import { Range, TextDocument, Uri } from 'vscode';
import { SuggestionCodeLens } from './suggestionCodeLens';

export function createFromPackageResponses(
  document: TextDocument,
  suggestions: Array<PackageResponse>,
  replaceVersionFn: TSuggestionReplaceFunction,
): Array<SuggestionCodeLens> {
  return suggestions.map(
    function (response) {
      return createFromPackageResponse(
        response,
        document,
        replaceVersionFn
      );
    }
  );
}

function createFromPackageResponse(
  packageResponse: PackageResponse,
  document: TextDocument,
  replaceVersionFn: TSuggestionReplaceFunction,
): SuggestionCodeLens {
  const { nameRange, versionRange } = packageResponse;
  const commandRangePos = nameRange.start + packageResponse.order;
  const commandRange = new Range(
    document.positionAt(commandRangePos),
    document.positionAt(commandRangePos)
  );
  const replaceRange = new Range(
    document.positionAt(versionRange.start),
    document.positionAt(versionRange.end)
  );
  return new SuggestionCodeLens(
    commandRange,
    replaceRange,
    packageResponse,
    Uri.file(document.fileName),
    replaceVersionFn
  );
}