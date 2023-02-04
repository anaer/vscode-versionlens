import { ExtensionContext } from 'vscode';
import { configureContainer } from './extensionContainer';

export async function activate(context: ExtensionContext) {

  return await configureContainer(context)
    .then(container => {

      const { version } = require('../package.json');

      const { logger, loggingOptions } = container.cradle;

      // log general start up info
      logger.info('version: %s', version);
      logger.info('log level: %s', loggingOptions.level);
      logger.info('log path: %s', context.logPath);

      // instantiate commands
      container.resolve('iconCommands');
      container.resolve('suggestionCommands');

      // instantiate events
      container.resolve('textDocumentEvents');
      container.resolve('textEditorEvents');
    });

}