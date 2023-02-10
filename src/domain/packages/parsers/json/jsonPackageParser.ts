import { TPackageLocationDescriptor } from 'domain/packages';
import * as JsonC from 'jsonc-parser';
import {
  createPackageDescFromJsonNode,
  createPathDescFromJsonNode,
  createRepoDescFromJsonNode,
  createVersionDescFromJsonNode
} from './jsonPackageTypeFactory';

const complexTypeHandlers = {
  "version": createVersionDescFromJsonNode,
  "path": createPathDescFromJsonNode,
  "repository": createRepoDescFromJsonNode
};

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
    const [keyNode, valueNode] = node.children;
    const isStringType = valueNode.type == "string";

    // parse string properties
    if (isStringType && (noIncludePropName || keyNode.value === includePropName)) {

      // create the package descriptor
      const packageDesc = createPackageDescFromJsonNode(parentKeyNode || keyNode)

      // add the version type to the package desc
      const versionDesc = createVersionDescFromJsonNode(parentKeyNode, valueNode);
      packageDesc.types.push(versionDesc);

      // add the package desc to the matched array
      matchedDependencies.push(packageDesc);

      continue;
    }

    // parse complex properties
    if (valueNode.type == "object") {

      // create the package descriptor
      const packageDesc = createPackageDescFromJsonNode(parentKeyNode || keyNode);

      for (const typeName in complexTypeHandlers) {

        const typeNode = JsonC.findNodeAtLocation(valueNode, [typeName]);

        if (typeNode) {
          // get the type desc
          const handler = complexTypeHandlers[typeName];

          // add the handled type to the package desc
          const typeDesc = handler(
            keyNode,
            typeNode
          );

          // skip types that are't fully defined
          if (!typeDesc) continue;

          packageDesc.types.push(typeDesc);
        }
      }

      // skip when no types were added
      if (packageDesc.types.length === 0) continue;

      // add the package desc to the matched array
      matchedDependencies.push(packageDesc);
    }

  }

  return matchedDependencies;
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