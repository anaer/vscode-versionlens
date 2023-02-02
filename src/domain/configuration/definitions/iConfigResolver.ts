import { IConfig } from "domain/configuration";

export interface iConfigResolver {
  getConfiguration: (section: string) => IConfig
}