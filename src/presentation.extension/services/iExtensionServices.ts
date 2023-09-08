import { DependencyCache } from 'domain/packages';
import {
  OnActiveTextEditorChange,
  OnClearCache,
  OnErrorClick,
  OnFileLinkClick,
  OnPackageDependenciesChanged,
  OnProviderEditorActivated,
  OnProviderTextDocumentChange,
  OnProviderTextDocumentClose,
  OnProviderTextDocumentSave,
  OnSaveChanges,
  OnTextDocumentChange,
  OnTextDocumentClose,
  OnTextDocumentSave,
  OnTogglePrereleases,
  OnToggleReleases,
  OnUpdateDependencyClick,
  SuggestionCodeLensProvider,
  VersionLensExtension
} from 'presentation.extension';
import { OutputChannel } from 'vscode';

export interface IExtensionServices {

  extension: VersionLensExtension;

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

  onProviderTextDocumentSave: OnProviderTextDocumentSave;

  onPackageDependenciesChanged: OnPackageDependenciesChanged;

  onClearCache: OnClearCache;

  onSaveChanges: OnSaveChanges;

  onFileLinkClick: OnFileLinkClick;

  onUpdateDependencyClick: OnUpdateDependencyClick;

  onToggleReleases: OnToggleReleases;

  onTogglePrereleases: OnTogglePrereleases;

  onErrorClick: OnErrorClick;

}