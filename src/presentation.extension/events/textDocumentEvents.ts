// vscode references
import { ILogger } from 'domain/logging';
import { VersionLensState } from '../state/versionLensState';

export class TextDocumentEvents {

  state: VersionLensState;

  logger: ILogger;

  constructor(extensionState: VersionLensState, logger: ILogger) {
    this.state = extensionState;
    this.logger = logger;

    // TODO added document save event and fire custom task if any versions have changes
  }

}