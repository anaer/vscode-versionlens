import { TPackageDependencyRange } from "../../definitions/tPackageDependencyRange";
import { TPackageTypeDescriptor } from "./tPackageTypeDescriptors";

export type TPackageDescriptor = {

  name: string,

  nameRange: TPackageDependencyRange;

  types: Array<TPackageTypeDescriptor>;

}