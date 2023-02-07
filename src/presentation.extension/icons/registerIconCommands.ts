import { ILogger } from "domain/logging";
import {
  CommandUtils,
  IconCommandContributions,
  IconCommandHandlers,
  VersionLensProvider,
  VersionLensState
} from "presentation.extension";
import * as VsCode from 'vscode';

/**
 * Registers the IconCommandHandlers class with di
 */
export function registerIconCommands(
  state: VersionLensState,
  versionLensProviders: Array<VersionLensProvider>,
  subscriptions: Array<VsCode.Disposable>,
  outputChannel: VsCode.OutputChannel,
  logger: ILogger
): IconCommandHandlers {

  // create the dependency
  const instance = new IconCommandHandlers(
    state,
    outputChannel,
    versionLensProviders
  );

  // register the commands
  const commands = CommandUtils.registerCommands(
    IconCommandContributions,
    <any>instance,
    logger
  );

  // add the commands to the disposal subscriptions
  subscriptions.push(...commands);

  return instance;
}