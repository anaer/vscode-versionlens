import { IServiceProvider } from 'domain/di';
import { ILogger, ILoggingOptions } from 'domain/logging';
import { DomainService } from 'domain/services';
import { nameOf, readJsonFile } from 'domain/utils';
import { ExtensionContext, workspace } from 'vscode';
import { configureContainer } from './extensionContainer';
import { ExtensionService } from './services/extensionService';

let serviceProvider: IServiceProvider;

export async function activate(context: ExtensionContext): Promise<void> {
  serviceProvider = await configureContainer(context)

  // log general start up info
  const domainService = nameOf<DomainService>();
  const logger = serviceProvider.getService<ILogger>(domainService.logger);
  const loggingOptions = serviceProvider.getService<ILoggingOptions>(domainService.loggingOptions);

  // check editor.codeLens is enabled
  const codeLensEnabled = workspace.getConfiguration().get('editor.codeLens')
  if (codeLensEnabled === false) {
    logger.error(
      "Code lenses are disabled. This extension won't work unless you enable 'editor.codeLens' in your vscode settings"
    );
  }

  const extensionPath = context.asAbsolutePath('');
  const packageJsonPath = context.asAbsolutePath('package.json');
  const { version } = await readJsonFile<any>(packageJsonPath);

  logger.info('path: %s', extensionPath);
  logger.info('version: %s', version);
  logger.info('log level: %s', loggingOptions.level);

  const extensionService = nameOf<ExtensionService>();

  // instantiate command handlers
  serviceProvider.getService(extensionService.iconCommandHandlers);
  serviceProvider.getService(extensionService.suggestionCommandHandlers);

  // instantiate events
  serviceProvider.getService(extensionService.textDocumentEvents);
  serviceProvider.getService(extensionService.textEditorEvents);
}

export function deactivate() {
  serviceProvider.dispose();
}