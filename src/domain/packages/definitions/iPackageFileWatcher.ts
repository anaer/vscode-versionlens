import { PackageDependency } from "domain/packages";
import { ISuggestionProvider } from "domain/suggestions";

export type OnPackageDependenciesChangedFunction = (
  provider: ISuggestionProvider,
  packageFilePath: string,
  packageDeps: PackageDependency[]
) => Promise<void>;

export type OnPackageFileUpdatedFunction = (
  provider: ISuggestionProvider,
  packageFilePath: string,
  packageDeps: PackageDependency[]
) => Promise<void>;

export interface IPackageFileWatcher {

  initialize(): Promise<void>;

  watch: () => void;

  registerOnPackageDependenciesChanged: (
    listener: OnPackageDependenciesChangedFunction,
    thisArg: any
  ) => void;

}