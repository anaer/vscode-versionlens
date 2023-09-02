import { PackageDependency } from "domain/packages";
import { ISuggestionProvider } from "domain/suggestions";

export type OnPackageDependenciesUpdatedFunction = (
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

  registerOnPackageDependenciesUpdated: (
    listener: OnPackageDependenciesUpdatedFunction,
    thisArg: any
  ) => void;

  registerOnPackageFileUpdated: (
    listener: OnPackageFileUpdatedFunction, 
    thisArg: any
  ) => void;

}