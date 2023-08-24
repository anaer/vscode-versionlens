import { ILogger } from "domain/logging";
import { IProvider } from "domain/providers";

export type OnChangeFunction = (provider: IProvider,logger: ILogger) => Promise<boolean>;

export interface IPackageDependencyWatcher {

  watch: () => IPackageDependencyWatcher;

  registerOnDependenciesChange: (listener: OnChangeFunction) => void;

}