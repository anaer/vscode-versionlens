import { CachingOptions, HttpOptions } from 'domain/clients';
import { AppConfig } from 'domain/configuration';
import { ILogger, ILoggerChannel, LoggingOptions } from 'domain/logging';
import { ISuggestionProvider } from 'domain/suggestions';
import {
  IconCommands,
  SuggestionCommands,
  TextEditorEvents,
  VersionLensExtension,
  VersionLensProvider
} from 'presentation.extension';
import { Disposable, OutputChannel } from 'vscode';

export interface IExtensionServices {

  // application services
  loggingOptions: LoggingOptions,

  httpOptions: HttpOptions,

  cachingOptions: CachingOptions,

  loggerChannel: ILoggerChannel,

  logger: ILogger,

  providerNames: Array<string>,

  suggestionProviders: Array<ISuggestionProvider>,

  // extension services
  appConfig: AppConfig,

  extensionName: string,

  extension: VersionLensExtension,

  outputChannel: OutputChannel,

  subscriptions: Array<Disposable>,

  iconCommands: IconCommands,

  suggestionCommands: SuggestionCommands,

  textEditorEvents: TextEditorEvents,

  versionLensProviders: Array<VersionLensProvider>
}