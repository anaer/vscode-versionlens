import { IConfig } from "domain/configuration";

export interface IVsCodeWorkspace {
  getConfiguration: (section) => IConfig
}