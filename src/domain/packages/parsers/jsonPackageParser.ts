import * as JsonC from 'jsonc-parser';
import { createPackageResource, TPackageFileLocationDescriptor } from '../index';
import { PackageDependency } from '../models/packageDependency';

export function extractPackageDependenciesFromJson(
  packagePath: string,
  json: string,
  includePropNames: Array<string>
): Array<PackageDependency> {
  const jsonErrors = [];
  const jsonTree = JsonC.parseTree(json, jsonErrors);
  if (!jsonTree || jsonTree.children.length === 0 || jsonErrors.length > 0) {
    return [];
  }

  const packageDescriptors = extractFromNodes(jsonTree, includePropNames);

  return packageDescriptors.map(descriptor => new PackageDependency(
    createPackageResource(
      descriptor.name,
      descriptor.version,
      packagePath
    ),
    descriptor.nameRange,
    descriptor.versionRange
  ));
}

export function extractFromNodes(
  jsonTree: JsonC.Node,
  includePropNames: string[]
): TPackageFileLocationDescriptor[] {
  const collector = [];

  for (const property of includePropNames) {
    const node = findNodesAtLocation(jsonTree, property);
    if (!node) continue;

    if (node instanceof Array) {
      collectDependencyNodes(node, null, '', collector);
    } else {
      collectDependencyNodes(node.children, null, '', collector);
    }

  }

  return collector
}

function collectDependencyNodes(
  nodes: Array<JsonC.Node>,
  parentKey: JsonC.Node,
  filterName: string,
  collector = []
) {
  nodes.forEach(
    function (node) {
      const [keyEntry, valueEntry] = node.children;

      if (valueEntry.type == "string" &&
        (filterName.length === 0 || keyEntry.value === filterName)) {
        const dependencyLens = createFromProperty(
          parentKey || keyEntry, valueEntry
        );
        collector.push(dependencyLens);
      } else if (valueEntry.type == "object") {
        collectDependencyNodes(
          valueEntry.children,
          keyEntry,
          'version',
          collector
        )
      }
    }
  )
}

function createFromProperty(keyEntry, valueEntry): TPackageFileLocationDescriptor {
  const nameRange = {
    start: keyEntry.offset,
    end: keyEntry.offset,
  }

  // +1 and -1 to be inside quotes
  const versionRange = {
    start: valueEntry.offset + 1,
    end: valueEntry.offset + valueEntry.length - 1,
  }

  // handle override dependency selectors in the name
  let name = keyEntry.value;
  const atIndex = name.indexOf('@');
  if (atIndex > 0) {
    name = name.slice(0, atIndex);
  }

  return {
    name,
    version: valueEntry.value,
    nameRange,
    versionRange
  };
}

function findNodesAtLocation(
  jsonTree: JsonC.Node,
  expression: string
): JsonC.Node | Array<JsonC.Node> {
  const pathSegments = expression.split(".");

  // if the path doesn't end with * then process a standard path
  if (pathSegments[pathSegments.length - 1] !== "*") {
    return JsonC.findNodeAtLocation(jsonTree, pathSegments);
  }

  // find the node up until the .*
  const segmentsWithoutStar = pathSegments.slice(0, pathSegments.length - 1);
  const nodeUntilDotStar = JsonC.findNodeAtLocation(
    jsonTree,
    segmentsWithoutStar
  );

  if (!nodeUntilDotStar) return null;

  if (!nodeUntilDotStar.children || nodeUntilDotStar.children.length === 0) {
    return null;
  }

  // filter the childrens children where the value type is "object"
  return nodeUntilDotStar.children
    .filter(x => x.children && x.children.length === 2)
    .flat()
    .filter(x => x.children[1].type === "object")
    .flatMap(x => x.children[1].children);
}