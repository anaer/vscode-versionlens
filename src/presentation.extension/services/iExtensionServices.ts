import {
  IconCommandHandlers,
  SuggestionCodeLensProvider,
  SuggestionCommandHandlers,
  TextEditorEvents,
  VersionLensExtension
} from 'presentation.extension';
import { OutputChannel } from 'vscode';
import { SaveChangesTask } from '../commands/saveChangesTask';

export interface IExtensionServices {

  extension: VersionLensExtension;

  outputChannel: OutputChannel;

  iconCommandHandlers: IconCommandHandlers;

  suggestionCommandHandlers: SuggestionCommandHandlers;

  textEditorEvents: TextEditorEvents;

  versionLensProviders: Array<SuggestionCodeLensProvider>;

  saveChangesTask: SaveChangesTask;

}