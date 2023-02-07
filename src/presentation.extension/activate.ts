import { ILogger, ILoggingOptions } from 'domain/logging';
import { DomainService } from 'domain/services';
import { nameOf } from 'domain/utils';
import { ExtensionContext, workspace } from 'vscode';
import { configureContainer } from './extensionContainer';
import { ExtensionService } from './services';

export async function activate(context: ExtensionContext) {

  return await configureContainer(context)
    .then(serviceProvider => {

      const { version } = require('../package.json');

      // log general start up info
      const domainService = nameOf<DomainService>();
      const logger = serviceProvider.getService<ILogger>(domainService.logger);
      const loggingOptions = serviceProvider.getService<ILoggingOptions>(domainService.loggingOptions);
      const codeLensEnabled = workspace.getConfiguration().get('editor.codeLens')

      if (codeLensEnabled === false) {
        logger.error(
          "codelens is disabled. This extension won't work unless you enable 'editor.codeLens' in your vscode settings"
        );
      }

      logger.info('version: %s', version);
      logger.info('log level: %s', loggingOptions.level);
      logger.info('log path: %s', context.logPath);

      const extensionService = nameOf<ExtensionService>();

      // instantiate commands
      serviceProvider.getService(extensionService.iconCommands);
      serviceProvider.getService(extensionService.suggestionCommands);

      // instantiate events
      serviceProvider.getService(extensionService.textDocumentEvents);
      serviceProvider.getService(extensionService.textEditorEvents);
    });

}