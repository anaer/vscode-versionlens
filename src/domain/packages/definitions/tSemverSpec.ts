import { PackageVersionType } from "./ePackageVersionType";

export type TSemverSpec = {

  rawVersion: string,

  type: PackageVersionType,

};