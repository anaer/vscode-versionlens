import { TPackageDependencyRange } from "../definitions/tPackageDependencyRange";
import { TPackageNameVersion } from "../definitions/tPackageNameVersion";

export class PackageDependency {

  constructor(
    nameRange: TPackageDependencyRange,
    versionRange: TPackageDependencyRange,
    packageInfo: TPackageNameVersion
  ) {
    this.nameRange = nameRange;
    this.versionRange = versionRange;
    this.packageInfo = packageInfo;
  }

  nameRange: TPackageDependencyRange;

  versionRange: TPackageDependencyRange;

  packageInfo: TPackageNameVersion;

  equals(other: PackageDependency) {
    return other.packageInfo.name === this.packageInfo.name
      && other.packageInfo.version === this.packageInfo.version
      && other.versionRange.start === this.versionRange.start
      && other.versionRange.end === this.versionRange.end
      && other.nameRange.start === this.nameRange.start
      && other.nameRange.end === this.nameRange.end;
  }

};