import { extractFromNodes, IPackageDependency } from 'domain/packages';
import * as JsonC from 'jsonc-parser';

export function extractPackageDependenciesFromJson(
  json: string,
  includePropNames: Array<string>
): Array<IPackageDependency> {
  const jsonErrors = [];
  const jsonTree = JsonC.parseTree(json, jsonErrors);
  if (!jsonTree || jsonTree.children.length === 0 || jsonErrors.length > 0) return [];

  const children = jsonTree.children;
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    const [keyEntry, valueEntry] = node.children;
    if (keyEntry.value === 'jspm') {
      return extractFromNodes(valueEntry, includePropNames);
    }
  }

  return [];
}