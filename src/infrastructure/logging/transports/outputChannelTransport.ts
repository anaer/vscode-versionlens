import { ILoggerChannel, ILoggingOptions } from 'domain/logging';
import { OutputChannel } from 'vscode';

const { Transport: WinstonChannel } = require('winston');
const MESSAGE = Symbol.for('message');

export class OutputChannelTransport extends WinstonChannel implements ILoggerChannel {

  constructor(outputChannel: OutputChannel, logging: ILoggingOptions) {
    super({ level: logging.level });
    this.outputChannel = outputChannel;
    this.logging = logging;
  }

  outputChannel: OutputChannel;

  logging: ILoggingOptions;

  get name() {
    return this.outputChannel.name;
  }

  log(entry, callback) {

    setImmediate(() => {
      this.emit('logged', entry)
      this.outputChannel.appendLine(`${entry[MESSAGE]}`);
    });

    callback();
  }

  refreshLoggingLevel() {
    this.logging.defrost();
    super.level = this.logging.level;
  }

}