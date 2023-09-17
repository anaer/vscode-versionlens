import { PackageDependency } from "domain/packages";
import { ISuggestionProvider } from "domain/providers";

export type OnPackageDependenciesChangedEvent = (
  provider: ISuggestionProvider,
  packageFilePath: string,
  packageDeps: PackageDependency[]
) => Promise<void>;

export interface IPackageFileWatcher {

  initialize(): Promise<void>;

  watch: () => void;

  registerListener: (
    listener: OnPackageDependenciesChangedEvent,
    thisArg: any
  ) => void;

}