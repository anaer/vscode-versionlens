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

export interface IPackageDependencyWatcher {

  initialize(): Promise<void>;

  watch: () => IPackageDependencyWatcher;

  registerOnPackageDependenciesUpdated: (listener: OnPackageDependenciesUpdatedFunction) => void;

  registerOnPackageFileUpdated: (listener: OnPackageFileUpdatedFunction) => void;

}