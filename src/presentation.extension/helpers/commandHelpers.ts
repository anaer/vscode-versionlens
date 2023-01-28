// vscode references
import * as VsCode from 'vscode';
import { KeyDictionary } from 'domain/generics';
import { ILogger } from 'domain/logging';

export function registerCommands(
  contributions: KeyDictionary<string>,
  handlers: KeyDictionary<Function>,
  logger: ILogger
): Array<VsCode.Disposable> {

  const { commands } = VsCode;
  const disposables = [];

  // loop enum keys
  Object.keys(contributions)
    .forEach(enumKey => {

      // register command
      const command = contributions[enumKey];
      const handler = handlers[`on${enumKey}`];
      if (!handler) {
        // todo roll up errors to a semantic factory
        const msg = `Could not find %s handler on %s class`;
        logger.error(msg, command, handler.name)
        // just return here?
        throw new Error(`Could not find ${command} handler on ${handler.name} class`)
      }

      // collect disposables
      disposables.push(
        commands.registerCommand(command, handler.bind(handlers))
      )
    });

  return disposables;
}