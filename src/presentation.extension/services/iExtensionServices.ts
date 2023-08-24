import { ICache } from 'domain/caching';
import {
  IconCommandHandlers,
  SuggestionCodeLensProvider,
  SuggestionCommandHandlers,
  TextEditorEvents,
  VersionLensExtension
} from 'presentation.extension';
import { OutputChannel } from 'vscode';

export interface IExtensionServices {

  extension: VersionLensExtension;

  outputChannel: OutputChannel;

  iconCommandHandlers: IconCommandHandlers;

  suggestionCommandHandlers: SuggestionCommandHandlers;

  textEditorEvents: TextEditorEvents;

  versionLensProviders: Array<SuggestionCodeLensProvider>;

}