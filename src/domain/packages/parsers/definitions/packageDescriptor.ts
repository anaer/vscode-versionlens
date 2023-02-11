import { KeyDictionary } from "domain/generics";
import { TPackageDependencyRange } from "../../definitions/tPackageDependencyRange";
import { TPackageTypeDescriptor } from "./tPackageTypeDescriptors";

export class PackageDescriptor {

  constructor(name: string, nameRange: TPackageDependencyRange) {
    this.name = name;
    this.nameRange = nameRange;
    this.types = {};
    this.typeCount = 0;
  }

  name: string;

  nameRange: TPackageDependencyRange;

  types: KeyDictionary<TPackageTypeDescriptor>;

  typeCount: number;

  addType(desc: TPackageTypeDescriptor) {
    this.types[desc.type] = desc;
    this.typeCount++;
  }

  hasType(descType: string): boolean {
    return Reflect.has(this.types, descType);
  }

  getType<T extends TPackageTypeDescriptor>(descType: string): T {
    return this.types[descType] as T;
  }

}