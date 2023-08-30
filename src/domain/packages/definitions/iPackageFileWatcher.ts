import { PackageDependency } from "domain/packages";
import { ISuggestionProvider } from "../../suggestions/definitions/iSuggestionProvider";

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

  watch: () => IPackageFileWatcher;

  registerOnPackageDependenciesUpdated: (
    listener: OnPackageDependenciesUpdatedFunction,
    thisArg: any
  ) => void;

  registerOnPackageFileUpdated: (
    listener: OnPackageFileUpdatedFunction, 
    thisArg: any
  ) => void;

}