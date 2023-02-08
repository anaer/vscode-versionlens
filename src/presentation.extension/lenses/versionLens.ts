import {
  PackageClientSourceType,
  PackageResponse,
  PackageResponseError
} from 'domain/packages';
import { TSuggestionReplaceFunction } from 'domain/suggestions';
import { CodeLens, Range, Uri } from 'vscode';

export class VersionLens extends CodeLens {

  replaceRange: Range;

  package: PackageResponse;

  documentUrl: Uri;

  replaceVersionFn: TSuggestionReplaceFunction;

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
    this.command = null;
    this.replaceVersionFn = replaceVersionFn;
  }

  hasPackageSource(source: PackageClientSourceType): boolean {
    return this.package.source === source;
  }

  hasPackageError(error: PackageResponseError): boolean {
    return this.package.error == error;
  }

  setCommand(title: string, command, args) {
    this.command = {
      title,
      command,
      arguments: args
    };
    return this;
  }

}