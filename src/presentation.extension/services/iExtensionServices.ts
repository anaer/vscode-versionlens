import { DependencyCache } from 'domain/packages';
import {
  OnActiveTextEditorChange,
  OnClearCache,
  OnFileLinkClick,
  OnPackageDependenciesUpdated,
  OnPackageFileUpdated,
  OnProviderEditorActivated,
  OnProviderTextDocumentChange,
  OnShowError,
  OnTextDocumentChange,
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

  editorDependencyCache: DependencyCache

  onActiveTextEditorChange: OnActiveTextEditorChange;

  onTextDocumentChange: OnTextDocumentChange;

  onProviderEditorActivated: OnProviderEditorActivated;

  onProviderTextDocumentChange: OnProviderTextDocumentChange;

  onPackageDependenciesUpdated: OnPackageDependenciesUpdated;

  onPackageFileUpdated: OnPackageFileUpdated;

  onClearCache: OnClearCache;

  onFileLinkClick: OnFileLinkClick;

  onUpdateDependencyClick: OnUpdateDependencyClick;

  onToggleReleases: OnToggleReleases;

  onTogglePrereleases: OnTogglePrereleases;

  onShowError: OnShowError;

}