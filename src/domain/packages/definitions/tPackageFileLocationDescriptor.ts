import { TPackageDependencyRange } from "./tPackageDependencyRange";
import { TPackageNameVersion } from "./tPackageNameVersion";

export type TPackageFileLocationDescriptor = TPackageNameVersion & {

  nameRange: TPackageDependencyRange;

  versionRange: TPackageDependencyRange;

}