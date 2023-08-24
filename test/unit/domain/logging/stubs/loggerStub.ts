import { KeyDictionary } from 'domain/generics';
import { ILogger, LogLevelTypes, TChildLoggerOptions } from 'domain/logging';

export class LoggerStub implements ILogger {

  log(
    level: LogLevelTypes,
    message: string,
    splats: KeyDictionary<any>
  ): void { }

  info(message: string, ...splats: any): void { }

  debug(message: string, ...splats: any): void { }

  verbose(message: string, ...splats: any): void { }

  error(message: string, ...splats: any): void { }

  child(options: TChildLoggerOptions): ILogger {
    return this;
  }

}