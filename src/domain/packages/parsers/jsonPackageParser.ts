import * as JsonC from 'jsonc-parser';
import {
  TPackageLocationDescriptor,
  TPackageVersionLocationDescriptor
} from '../index';

export function extractPackageDependenciesFromJson(
  json: string,
  includePropNames: Array<string>
): Array<TPackageLocationDescriptor> {
  const jsonErrors = [];
  const rootNode = JsonC.parseTree(json, jsonErrors);
  if (!rootNode || rootNode.children.length === 0 || jsonErrors.length > 0) {
    return [];
  }

  return extractDependenciesFromNodes(rootNode, includePropNames);
}

function extractDependenciesFromNodes(
  rootNode: JsonC.Node,
  includePropNames: string[]
): Array<TPackageLocationDescriptor> {
  const matchedDependencies: Array<TPackageLocationDescriptor> = [];

  for (const incPropName of includePropNames) {
    const node = findNodesAtLocation(rootNode, incPropName);
    if (!node) continue;

    const children = node instanceof Array
      ? descendChildNodes(node, null, "")
      : descendChildNodes(node.children, null, "");

    matchedDependencies.push.apply(matchedDependencies, children);
  }

  return matchedDependencies
}

function descendChildNodes(
  nodes: Array<JsonC.Node>,
  parentKeyNode: JsonC.Node,
  includePropName: string
): Array<TPackageLocationDescriptor> {
  const matchedDependencies: Array<TPackageLocationDescriptor> = [];
  const noIncludePropName = includePropName.length === 0;

  for (const node of nodes) {
    const [keyEntry, valueEntry] = node.children;

    if (valueEntry.type == "string" &&
      (noIncludePropName || keyEntry.value === includePropName)) {

      // create dependency location from the property
      const dependencyLoc = createLocFromVersionProperty(
        parentKeyNode,
        keyEntry,
        valueEntry
      );

      matchedDependencies.push(dependencyLoc);

    } else if (valueEntry.type == "object") {
      // recurse child nodes
      const children = descendChildNodes(
        valueEntry.children,
        keyEntry,
        'version'
      )

      matchedDependencies.push.apply(matchedDependencies, children);
    }
  }

  return matchedDependencies;
}

function createLocFromVersionProperty(
  parentKeyNode: JsonC.Node,
  keyNode: JsonC.Node,
  valueNode: JsonC.Node
): TPackageLocationDescriptor {

  const node = parentKeyNode || keyNode;

  const nameRange = {
    start: node.offset,
    end: node.offset,
  };

  // +1 and -1 to be inside quotes
  const versionRange = {
    start: valueNode.offset + 1,
    end: valueNode.offset + valueNode.length - 1,
  };

  const versionDesc: TPackageVersionLocationDescriptor = {
    type: "version",
    version: valueNode.value,
    versionRange
  }

  return {
    name: node.value,
    nameRange,
    types: [versionDesc]
  };
}

function findNodesAtLocation(
  jsonTree: JsonC.Node,
  expression: string
): JsonC.Node | Array<JsonC.Node> {
  const pathSegments: Array<JsonC.Segment> = expression.split(".");

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