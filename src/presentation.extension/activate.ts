import { IServiceProvider } from 'domain/di';
import { ILogger, ILoggingOptions } from 'domain/logging';
import { IDomainServices } from 'domain/services';
import { nameOf, readJsonFile } from 'domain/utils';
import { join } from 'node:path';
import { ExtensionContext, workspace } from 'vscode';
import { configureContainer } from './extensionContainer';
import { IExtensionServices } from './services/iExtensionServices';
import { VersionLensExtension } from './versionLensExtension';

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

  // instantiate command handlers
  serviceProvider.getService(serviceNames.iconCommandHandlers);
  serviceProvider.getService(serviceNames.suggestionCommandHandlers);

  // instantiate events
  serviceProvider.getService(serviceNames.textDocumentEvents);
  serviceProvider.getService(serviceNames.textEditorEvents);
}

export async function deactivate() {
  await serviceProvider.dispose();
}