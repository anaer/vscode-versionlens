import { DependencyCache } from 'domain/packages';
import {
  OnActiveTextEditorChange,
  OnClearCache,
  OnFileLinkClick,
  OnPackageDependenciesChanged,
  OnProviderEditorActivated,
  OnProviderTextDocumentChange,
  OnProviderTextDocumentClose,
  OnShowError,
  OnTextDocumentChange,
  OnTextDocumentClose,
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

  // version lens events
  onProviderEditorActivated: OnProviderEditorActivated;

  onProviderTextDocumentChange: OnProviderTextDocumentChange;

  onProviderTextDocumentClose: OnProviderTextDocumentClose;

  onPackageDependenciesChanged: OnPackageDependenciesChanged;

  onClearCache: OnClearCache;

  onFileLinkClick: OnFileLinkClick;

  onUpdateDependencyClick: OnUpdateDependencyClick;

  onToggleReleases: OnToggleReleases;

  onTogglePrereleases: OnTogglePrereleases;

  onShowError: OnShowError;

}