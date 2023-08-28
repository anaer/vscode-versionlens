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

  execute(activeProviders: ISuggestionProvider[], document: TextDocument) {
    this.logger.debug("%s provider editors activated", activeProviders.map(x => x.name));

    // ensure the latest logging level is set
    this.loggerChannel.refreshLoggingLevel();
  }

}