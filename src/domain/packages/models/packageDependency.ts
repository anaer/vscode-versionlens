import { TPackageDependencyRange } from "../definitions/tPackageDependencyRange";
import { TPackageResource } from "../index";

export class PackageDependency {

  constructor(
    packageRes: TPackageResource,
    nameRange: TPackageDependencyRange,
    versionRange: TPackageDependencyRange
  ) {
    this.package = packageRes;
    this.nameRange = nameRange;
    this.versionRange = versionRange;
  }

  nameRange: TPackageDependencyRange;

  versionRange: TPackageDependencyRange;

  package: TPackageResource;

  packageEquals(other: PackageDependency) {
    return other.package.name === this.package.name
      && other.package.version === this.package.version
  }

  rangeEquals(other: PackageDependency) {
    return other.versionRange.start === this.versionRange.start
      && other.versionRange.end === this.versionRange.end
      && other.nameRange.start === this.nameRange.start
      && other.nameRange.end === this.nameRange.end;
  }

};