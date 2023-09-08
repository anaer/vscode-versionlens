import { IServiceProvider } from 'domain/di';
import { ILogger, ILoggingOptions } from 'domain/logging';
import { IPackageFileWatcher } from 'domain/packages';
import { IDomainServices } from 'domain/services';
import { nameOf, readJsonFile } from 'domain/utils';
import { join } from 'node:path';
import {
  IExtensionServices,
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
  OnTogglePrereleases,
  OnToggleReleases,
  OnUpdateDependencyClick,
  VersionLensExtension,
  configureContainer
} from 'presentation.extension';
import { ExtensionContext, window, workspace } from 'vscode';

let serviceProvider: IServiceProvider;

export async function activate(context: ExtensionContext): Promise<void> {
  // create the ioc service provider
  serviceProvider = await configureContainer(context)

  const serviceNames = nameOf<IDomainServices & IExtensionServices>();

  const logger = serviceProvider.getService<ILogger>(serviceNames.logger);

  const loggingOptions = serviceProvider.getService<ILoggingOptions>(
    serviceNames.loggingOptions
  );

  const extension = serviceProvider.getService<VersionLensExtension>(
    serviceNames.extension
  );

  // check editor.codeLens is enabled
  const codeLensEnabled = workspace.getConfiguration().get('editor.codeLens')
  if (codeLensEnabled === false) {
    logger.error(
      "Code lenses are disabled. This extension won't work unless you enable 'editor.codeLens' in your vscode settings"
    );
  }

  // get the extension info
  const extensionPath = context.asAbsolutePath("");
  const packageJsonPath = context.asAbsolutePath("package.json");
  const { version } = await readJsonFile<any>(packageJsonPath);

  // log general start up info
  const logPath = join(context.logUri.fsPath, "..");
  logger.info("extension path: %s", extensionPath);
  logger.info("workspace mode: %s", extension.isWorkspaceMode);
  logger.info("version: %s", version);
  logger.info("log level: %s", loggingOptions.level);
  logger.info("log folder: %s", logPath);

  // setup package dependency watcher
  await serviceProvider.getService<IPackageFileWatcher>(serviceNames.packageFileWatcher)
    // init and watch provider workspace files
    .initialize();

  // instantiate events
  serviceProvider.getService<OnErrorClick>(serviceNames.onErrorClick);
  serviceProvider.getService<OnToggleReleases>(serviceNames.onToggleReleases);
  serviceProvider.getService<OnTogglePrereleases>(serviceNames.onTogglePrereleases);
  serviceProvider.getService<OnUpdateDependencyClick>(serviceNames.onUpdateDependencyClick);
  serviceProvider.getService<OnFileLinkClick>(serviceNames.onFileLinkClick);
  serviceProvider.getService<OnClearCache>(serviceNames.onClearCache);
  serviceProvider.getService<OnPreSaveChanges>(serviceNames.onPreSaveChanges);
  serviceProvider.getService<OnSaveChanges>(serviceNames.onSaveChanges);
  serviceProvider.getService<OnPackageDependenciesChanged>(serviceNames.onPackageDependenciesChanged);
  serviceProvider.getService<OnProviderEditorActivated>(serviceNames.onProviderEditorActivated);
  serviceProvider.getService<OnProviderTextDocumentChange>(serviceNames.onProviderTextDocumentChange);
  serviceProvider.getService<OnProviderTextDocumentClose>(serviceNames.onProviderTextDocumentClose);

  // ensures this is run when the extension is first loaded
  serviceProvider.getService<OnActiveTextEditorChange>(serviceNames.onActiveTextEditorChange)
    .execute(window.activeTextEditor)
}

export async function deactivate() {
  await serviceProvider.dispose();
}