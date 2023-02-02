import { ILoggingOptions } from "./iLoggingOptions";

export interface ILoggerChannel {

  name: string;

  logging: ILoggingOptions;

  refreshLoggingLevel(): void;

}