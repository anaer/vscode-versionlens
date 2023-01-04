import { ILoggingOptions } from "domain/logging";

export interface ILoggerTransport {

  name: string;

  logging: ILoggingOptions;

  updateLevel();

}