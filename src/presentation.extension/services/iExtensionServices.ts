import {
  IconCommandHandlers,
  SuggestionCodeLensProvider,
  SuggestionCommandHandlers,
  TextDocumentEvents,
  TextEditorEvents,
  VersionLensExtension
} from 'presentation.extension';
import { OutputChannel } from 'vscode';

export interface IExtensionServices {

  extension: VersionLensExtension,

  outputChannel: OutputChannel,

  iconCommandHandlers: IconCommandHandlers,

  suggestionCommandHandlers: SuggestionCommandHandlers,

  textEditorEvents: TextEditorEvents,

  textDocumentEvents: TextDocumentEvents,

  versionLensProviders: Array<SuggestionCodeLensProvider>

}