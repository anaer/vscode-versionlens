import { DependencyCache } from 'domain/packages';
import {
  OnActiveTextEditorChange,
  OnClearCache,
  OnFileLinkClick,
  OnProviderEditorActivated,
  OnProviderTextDocumentChange,
  OnSaveChanges,
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

  tempDependencyCache: DependencyCache

  onActiveTextEditorChange: OnActiveTextEditorChange;

  onTextDocumentChange: OnTextDocumentChange;

  onProviderEditorActivated: OnProviderEditorActivated;

  onProviderTextDocumentChange: OnProviderTextDocumentChange;

  onSaveChanges: OnSaveChanges;

  onClearCache: OnClearCache;

  onFileLinkClick: OnFileLinkClick;

  onUpdateDependencyClick: OnUpdateDependencyClick;

  onToggleReleases: OnToggleReleases;

  onTogglePrereleases: OnTogglePrereleases;

  onShowError: OnShowError;

}