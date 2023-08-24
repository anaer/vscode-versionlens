import { PackageDependency } from "domain/packages";

export function hasPackageDepsChanged(
  original: PackageDependency[],
  changed: PackageDependency[]
): boolean {
  if (original.length !== changed.length) return true;

  for (const dep of original) {
    const noChange = changed.some(
      other => other.packageEquals(dep)
    );

    if (noChange === false) return true;
  }

  return false;
}