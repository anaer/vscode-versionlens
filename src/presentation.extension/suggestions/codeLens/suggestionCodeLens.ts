import { PackageResponse, TSuggestionReplaceFunction } from 'domain/packages';
import { CodeLens, Range, Uri } from 'vscode';

export class SuggestionCodeLens extends CodeLens {

  replaceRange: Range;

  package: PackageResponse;

  documentUrl: Uri;

  replaceVersionFn: TSuggestionReplaceFunction;

  preventExtraClicks: boolean;

  constructor(
    commandRange: Range,
    replaceRange: Range,
    packageResponse: PackageResponse,
    documentUrl: Uri,
    replaceVersionFn: TSuggestionReplaceFunction
  ) {
    super(commandRange);
    this.replaceRange = replaceRange || commandRange;
    this.package = packageResponse;
    this.documentUrl = documentUrl;
    this.command = undefined;
    this.replaceVersionFn = replaceVersionFn;
  }

  setCommand(title: string, command: string, args?: Array<any>) {
    this.command = {
      title,
      command,
      arguments: args
    };
    return this;
  }

}