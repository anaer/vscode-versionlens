import {
  IconCommandHandlers,
  SuggestionCommands,
  TextDocumentEvents,
  TextEditorEvents,
  VersionLensExtension,
  VersionLensProvider
} from 'presentation.extension';
import { Disposable, OutputChannel } from 'vscode';

export interface ExtensionService {

  extensionName: string,

  extension: VersionLensExtension,

  outputChannel: OutputChannel,

  subscriptions: Array<Disposable>,

  iconCommandHandlers: IconCommandHandlers,

  suggestionCommands: SuggestionCommands,

  textEditorEvents: TextEditorEvents,

  textDocumentEvents: TextDocumentEvents,

  versionLensProviders: Array<VersionLensProvider>

}