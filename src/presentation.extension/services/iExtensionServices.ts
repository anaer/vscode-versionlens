import { DependencyCache } from 'domain/packages';
import {
  OnActiveTextEditorChange,
  OnClearCache,
  OnErrorClick,
  OnFileLinkClick,
  OnPackageDependenciesChanged,
  OnPreSaveChanges,
  OnProviderEditorActivated,
  OnProviderTextDocumentChange,
  OnProviderTextDocumentClose,
  OnSaveChanges,
  OnTextDocumentChange,
  OnTextDocumentClose,
  OnTextDocumentSave,
  OnTogglePrereleases,
  OnToggleReleases,
  OnUpdateDependencyClick,
  SuggestionCodeLensProvider,
  SuggestionsOptions,
  VersionLensExtension,
  VersionLensState
} from 'presentation.extension';
import { OutputChannel } from 'vscode';

export interface IExtensionServices {

  suggestionOptions: SuggestionsOptions,

  extension: VersionLensExtension;

  versionLensState: VersionLensState;

  outputChannel: OutputChannel;

  versionLensProviders: Array<SuggestionCodeLensProvider>;

  editorDependencyCache: DependencyCache;

  // vscode events
  onActiveTextEditorChange: OnActiveTextEditorChange;

  onTextDocumentChange: OnTextDocumentChange;

  onTextDocumentClose: OnTextDocumentClose;

  onTextDocumentSave: OnTextDocumentSave;

  // version lens events
  onProviderEditorActivated: OnProviderEditorActivated;

  onProviderTextDocumentChange: OnProviderTextDocumentChange;

  onProviderTextDocumentClose: OnProviderTextDocumentClose;

  onPackageDependenciesChanged: OnPackageDependenciesChanged;

  onClearCache: OnClearCache;

  onPreSaveChanges: OnPreSaveChanges;

  onSaveChanges: OnSaveChanges;

  onFileLinkClick: OnFileLinkClick;

  onUpdateDependencyClick: OnUpdateDependencyClick;

  onToggleReleases: OnToggleReleases;

  onTogglePrereleases: OnTogglePrereleases;

  onErrorClick: OnErrorClick;

}