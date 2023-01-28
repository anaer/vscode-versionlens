// vscode references
import * as VsCode from 'vscode';
import { ILogger } from 'domain/logging';
import * as InstalledStatusHelpers from '../helpers/installedStatusHelpers';
import { VersionLensState } from '../state/versionLensState';

export class TextDocumentEvents {

  state: VersionLensState;

  logger: ILogger;

  constructor(extensionState: VersionLensState, logger: ILogger) {
    this.state = extensionState;
    this.logger = logger;

    // register workspace events
    const { workspace } = VsCode;

    workspace.onDidChangeTextDocument(
      this.onDidChangeTextDocument.bind(this)
    );
  }

  onDidChangeTextDocument(changeEvent: VsCode.TextDocumentChangeEvent) {
    // ensure version lens is active
    if (this.state.providerActive.value === false) return;

    const foundDecorations = [];
    const { contentChanges } = changeEvent;

    // get all decorations for all the lines that have changed
    contentChanges.forEach(change => {
      const startLine = change.range.start.line;
      let endLine = change.range.end.line;

      if (change.text.charAt(0) == '\n' || endLine > startLine) {
        InstalledStatusHelpers.removeDecorationsFromLine(startLine)
        return;
      }

      for (let line = startLine; line <= endLine; line++) {
        const lineDecorations = InstalledStatusHelpers.getDecorationsByLine(line);
        if (lineDecorations.length > 0)
          foundDecorations.push(...lineDecorations);
      }
    })

    if (foundDecorations.length === 0) return;

    // remove all decorations that have changed
    InstalledStatusHelpers.removeDecorations(foundDecorations);
  }

}