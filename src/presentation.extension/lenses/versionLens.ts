import { CodeLens, Range, Uri } from 'vscode';
import { TSuggestionReplaceFunction } from 'domain/suggestions';
import {
  PackageResponse,
  PackageResponseError,
  PackageSourceType
} from 'domain/packages';

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

  hasPackageSource(source: PackageSourceType): boolean {
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