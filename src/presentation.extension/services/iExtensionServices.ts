import { DependencyCache } from 'domain/packages';
import {
  IconCommandHandlers,
  OnActiveTextEditorChange,
  OnProviderEditorActivated,
  OnProviderTextDocumentChange,
  OnSaveChanges,
  OnTextDocumentChange,
  SuggestionCodeLensProvider,
  SuggestionCommandHandlers,
  VersionLensExtension
} from 'presentation.extension';
import { OutputChannel } from 'vscode';

export interface IExtensionServices {

  extension: VersionLensExtension;

  outputChannel: OutputChannel;

  iconCommandHandlers: IconCommandHandlers;

  suggestionCommandHandlers: SuggestionCommandHandlers;

  versionLensProviders: Array<SuggestionCodeLensProvider>;

  tempDependencyCache: DependencyCache

  onActiveTextEditorChange: OnActiveTextEditorChange;

  onTextDocumentChange: OnTextDocumentChange;

  onProviderEditorActivated: OnProviderEditorActivated;

  onProviderTextDocumentChange: OnProviderTextDocumentChange;

  onSaveChanges: OnSaveChanges;

}