import { throwUndefinedOrNull } from "@esm-test/guards";
import { ILogger, ILoggerChannel } from "domain/logging";
import { ISuggestionProvider } from "domain/suggestions";
import { TextDocument } from "vscode";

export class OnProviderEditorActivated {

  constructor(
    readonly loggerChannel: ILoggerChannel,
    readonly logger: ILogger,
  ) {
    throwUndefinedOrNull("loggerChannel", loggerChannel);
    throwUndefinedOrNull("logger", logger);
  }

  execute(activeProvider: ISuggestionProvider, document: TextDocument) {
    this.logger.debug("%s provider editor activated", activeProvider.name);

    // ensure the latest logging level is set
    this.loggerChannel.refreshLoggingLevel();
  }

}