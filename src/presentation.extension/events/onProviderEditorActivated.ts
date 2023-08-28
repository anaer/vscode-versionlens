import { throwNull, throwUndefined } from "@esm-test/guards";
import { ILogger, ILoggerChannel } from "domain/logging";
import { ISuggestionProvider } from "domain/suggestions";
import { TextDocument } from "vscode";

export class OnProviderEditorActivated {

  constructor(
    readonly loggerChannel: ILoggerChannel,
    readonly logger: ILogger,
  ) {
    throwUndefined("loggerChannel", loggerChannel);
    throwNull("loggerChannel", loggerChannel);

    throwUndefined("logger", logger);
    throwNull("logger", logger);
  }

  execute(activeProviders: ISuggestionProvider[], document: TextDocument) {
    this.logger.debug("%s provider editors activated", activeProviders.map(x => x.name));

    // ensure the latest logging level is set
    this.loggerChannel.refreshLoggingLevel();
  }

}