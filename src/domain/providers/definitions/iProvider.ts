import { ILogger } from "domain/logging/index.js";
import { IProviderConfig } from "./iProviderConfig";

export interface IProvider {

  config: IProviderConfig;

  logger: ILogger;

}