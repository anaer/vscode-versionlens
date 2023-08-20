import { PackageDependency } from "domain/packages";

export function hasPackageDepsChanged(
  original: PackageDependency[],
  recent: PackageDependency[]
): boolean {
  if (original.length !== recent.length) return true;

  for (const dep of original) {
    const noChange = recent.some(
      other => other.packageEquals(dep)
    );

    if (noChange === false) return true;
  }

  return false;
}