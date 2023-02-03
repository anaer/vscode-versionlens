import { TPackageDependencyRange } from "../definitions/tPackageDependencyRange";
import { TPackageResource } from "../index";

export class PackageDependency {

  constructor(
    packageInfo: TPackageResource,
    nameRange: TPackageDependencyRange,
    versionRange: TPackageDependencyRange
  ) {
    this.packageInfo = packageInfo;
    this.nameRange = nameRange;
    this.versionRange = versionRange;
  }

  nameRange: TPackageDependencyRange;

  versionRange: TPackageDependencyRange;

  packageInfo: TPackageResource;

  equals(other: PackageDependency) {
    return other.packageInfo.name === this.packageInfo.name
      && other.packageInfo.version === this.packageInfo.version
      && other.versionRange.start === this.versionRange.start
      && other.versionRange.end === this.versionRange.end
      && other.nameRange.start === this.nameRange.start
      && other.nameRange.end === this.nameRange.end;
  }

};