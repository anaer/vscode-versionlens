import { CodeLens, Range, Uri } from 'vscode';

import {
  PackageResponse,
  PackageResponseErrors,
  PackageSourceTypes,
  TReplaceVersionFunction,
} from 'core.packages';

export class VersionLens extends CodeLens {

  replaceRange: Range;

  package: PackageResponse;

  documentUrl: Uri;

  replaceVersionFn: TReplaceVersionFunction;

  command: any;

  constructor(
    commandRange: Range,
    replaceRange: Range,
    packageResponse: PackageResponse,
    documentUrl: Uri,
    replaceVersionFn: TReplaceVersionFunction
  ) {
    super(commandRange);
    this.replaceRange = replaceRange || commandRange;
    this.package = packageResponse;
    this.documentUrl = documentUrl;
    this.command = null;
    this.replaceVersionFn = replaceVersionFn;
  }

  hasPackageSource(source: PackageSourceTypes): boolean {
    return this.package.source === source;
  }

  hasPackageError(error: PackageResponseErrors): boolean {
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