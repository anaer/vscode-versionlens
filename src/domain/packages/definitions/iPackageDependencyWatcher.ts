import { PackageDependency } from "domain/packages";
import { ISuggestionProvider } from "../../suggestions/definitions/iSuggestionProvider";

export type OnPackageFileChangedFunction = (
  provider: ISuggestionProvider,
  packageDeps: PackageDependency[]
) => Promise<boolean>;

export interface IPackageDependencyWatcher {

  watch: () => IPackageDependencyWatcher;

  registerOnPackageFileChanged: (listener: OnPackageFileChangedFunction) => void;

}