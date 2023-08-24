import { PackageDependency } from "domain/packages";
import { IProvider } from "domain/providers";

export type OnChangeFunction = (
  provider: IProvider,
  packageDeps: PackageDependency[]
) => Promise<boolean>;

export interface IPackageDependencyWatcher {

  watch: () => IPackageDependencyWatcher;

  updateDependencies(providerName: string, packagePath: string, content: string): PackageDependency[];

  registerOnDependenciesChange: (listener: OnChangeFunction) => void;

}