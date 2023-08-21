import { PackageDependency } from "domain/packages";

export function hasPackageDepsChanged(
  original: PackageDependency[],
  edited: PackageDependency[]
): boolean {
  if (original.length !== edited.length) return true;

  for (const dep of original) {
    const noChange = edited.some(
      other => other.packageEquals(dep)
    );

    if (noChange === false) return true;
  }

  return false;
}