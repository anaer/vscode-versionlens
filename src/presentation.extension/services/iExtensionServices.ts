import { DependencyCache } from 'domain/packages';
import {
  IconCommandHandlers,
  OnActiveTextEditorChange,
  OnClearCache,
  OnFileLinkClick,
  OnProviderEditorActivated,
  OnProviderTextDocumentChange,
  OnSaveChanges,
  OnTextDocumentChange,
  OnUpdateDependencyClick,
  SuggestionCodeLensProvider,
  VersionLensExtension
} from 'presentation.extension';
import { OutputChannel } from 'vscode';

export interface IExtensionServices {

  extension: VersionLensExtension;

  outputChannel: OutputChannel;

  iconCommandHandlers: IconCommandHandlers;

  versionLensProviders: Array<SuggestionCodeLensProvider>;

  tempDependencyCache: DependencyCache

  onActiveTextEditorChange: OnActiveTextEditorChange;

  onTextDocumentChange: OnTextDocumentChange;

  onProviderEditorActivated: OnProviderEditorActivated;

  onProviderTextDocumentChange: OnProviderTextDocumentChange;

  onSaveChanges: OnSaveChanges;

  onClearCache: OnClearCache;

  onFileLinkClick: OnFileLinkClick;

  onUpdateDependencyClick: OnUpdateDependencyClick;

}