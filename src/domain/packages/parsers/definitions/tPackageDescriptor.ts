import { TPackageDependencyRange } from "../../definitions/tPackageDependencyRange";
import { TPackageTypeDescriptor } from "./tPackageTypeDescriptors";

export class PackageDescriptor {

  constructor(
    name: string,
    nameRange: TPackageDependencyRange,
    types: Array<TPackageTypeDescriptor>
  ) {
    this.name = name;
    this.nameRange = nameRange;
    this.types = types;
  }

  name: string;

  nameRange: TPackageDependencyRange;

  types: Array<TPackageTypeDescriptor>;

  hasType(depType: string): boolean {
    const filtered = this.types.filter(x => x.type === depType);
    return filtered.length > 0
      ? true
      : false;
  }

  getType(depType: string): TPackageTypeDescriptor | null {
    const filtered = this.types.filter(x => x.type === depType);
    return filtered.length > 0
      ? filtered[0]
      : null
  }

}