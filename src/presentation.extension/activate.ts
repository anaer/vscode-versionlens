import { ILogger, ILoggingOptions } from 'domain/logging';
import { ExtensionContext } from 'vscode';
import { configureContainer } from './extensionContainer';

export async function activate(context: ExtensionContext) {

  return await configureContainer(context)
    .then(serviceProvider => {

      const { version } = require('../package.json');

      // log general start up info
      const logger = serviceProvider.getService<ILogger>("logger");
      const loggingOptions = serviceProvider.getService<ILoggingOptions>("loggingOptions");

      logger.info('version: %s', version);
      logger.info('log level: %s', loggingOptions.level);
      logger.info('log path: %s', context.logPath);

      // instantiate commands
      serviceProvider.getService("iconCommands");
      serviceProvider.getService("suggestionCommands");

      // instantiate events
      serviceProvider.getService("textDocumentEvents");
      serviceProvider.getService("textEditorEvents");
    });

}