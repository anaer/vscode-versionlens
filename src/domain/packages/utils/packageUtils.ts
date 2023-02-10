import {
  TPackageDependencyRange,
  TPackageNameVersion,
  TPackageResource
} from "../index";

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

export function createPackageResource(
  name: string,
  version: string,
  path: string
): TPackageResource {
  return {
    name,
    version,
    path
  }
}