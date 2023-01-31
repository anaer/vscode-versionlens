import * as JsonC from 'jsonc-parser';
import { IPackageDependency } from '../definitions/iPackageDependency';

export function extractPackageDependenciesFromJson(
  json: string,
  includePropNames: Array<string>
): Array<IPackageDependency> {
  const jsonErrors = [];
  const jsonTree = JsonC.parseTree(json, jsonErrors);
  if (!jsonTree || jsonTree.children.length === 0 || jsonErrors.length > 0) return [];
  return extractFromNodes(jsonTree, includePropNames);
}

export function extractFromNodes(
  jsonTree: JsonC.Node,
  includePropNames: string[]
): IPackageDependency[] {
  const collector = [];

  for (const property of includePropNames) {
    const node = JsonC.findNodeAtLocation(jsonTree, property.split('.'));
    if (node) collectDependencyNodes(node.children, null, '', collector);
  }

  return collector
}

function collectDependencyNodes(nodes, parentKey, filterName: string, collector = []) {
  nodes.forEach(
    function (node) {
      const [keyEntry, valueEntry] = node.children;

      if (valueEntry.type == "string" &&
        (filterName.length === 0 || keyEntry.value === filterName)) {
        const dependencyLens = createFromProperty(parentKey || keyEntry, valueEntry);
        collector.push(dependencyLens);
      } else if (valueEntry.type == "object") {
        collectDependencyNodes(valueEntry.children, keyEntry, 'version', collector)
      }
    }
  )
}

function createFromProperty(keyEntry, valueEntry): IPackageDependency {
  const nameRange = {
    start: keyEntry.offset,
    end: keyEntry.offset,
  }

  // +1 and -1 to be inside quotes
  const versionRange = {
    start: valueEntry.offset + 1,
    end: valueEntry.offset + valueEntry.length - 1,
  }

  const packageInfo = {
    name: keyEntry.value,
    version: valueEntry.value
  }

  return {
    nameRange,
    versionRange,
    packageInfo
  }
}
