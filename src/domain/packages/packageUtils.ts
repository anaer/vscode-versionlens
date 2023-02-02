import { TPackageDependencyRange, TPackageIdentifier, TPackageNameVersion } from "./index";

export function createDependencyRange(
  start: number,
  end: number
): TPackageDependencyRange {
  return {
    start,
    end
  }
}

export function createPackageNameVersion(
  name: string,
  version: string
): TPackageNameVersion {
  return {
    name,
    version
  }
}

export function createPackageIdentifier(
  name: string,
  version: string,
  path: string
): TPackageIdentifier {
  return {
    name,
    version,
    path
  }
}