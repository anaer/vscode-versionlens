import { TPackageDependencyRange } from "../../definitions/tPackageDependencyRange";
import { TPackageTypeLocationDescriptor } from "./tPackageTypeDescriptors";

export type TPackageDescriptor = {

  name: string,

  nameRange: TPackageDependencyRange;

  types: Array<TPackageTypeLocationDescriptor>;

}