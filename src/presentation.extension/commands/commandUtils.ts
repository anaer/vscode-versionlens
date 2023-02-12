// vscode references
import { KeyDictionary, TAsyncFunction } from 'domain/generics';
import { ILogger } from 'domain/logging';
import * as VsCode from 'vscode';

export function registerCommands(
  contributions: KeyDictionary<string>,
  handlers: KeyDictionary<TAsyncFunction<any>>,
  logger: ILogger
): Array<VsCode.Disposable> {

  const { commands } = VsCode;
  const disposables: Array<VsCode.Disposable> = [];

  // loop enum keys
  Object.keys(contributions)
    .forEach(enumKey => {

      // register command
      const command = contributions[enumKey];
      const handler = handlers[`on${enumKey}`];
      if (!handler) {
        const msg = `Could not find %s handler on %s class`;
        logger.error(msg, command, `on${enumKey}`)
        throw new Error(`Could not find ${command} handler 'on${enumKey}'`)
      }

      // collect disposables
      disposables.push(
        commands.registerCommand(command, handler.bind(handlers))
      )
    });

  return disposables;
}