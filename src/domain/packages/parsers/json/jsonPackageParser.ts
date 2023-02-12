import { KeyDictionary, Undefinable } from 'domain/generics';
import { PackageDescriptor } from 'domain/packages';
import * as JsonC from 'jsonc-parser';
import { TJsonPackageTypeHandler } from '../definitions/tJsonPackageTypeHandler';
import {
  createPackageDescFromJsonNode,
  createPathDescFromJsonNode,
  createRepoDescFromJsonNode,
  createVersionDescFromJsonNode
} from './jsonPackageTypeFactory';

const complexTypeHandlers: KeyDictionary<TJsonPackageTypeHandler> = {
  "version": createVersionDescFromJsonNode,
  "path": createPathDescFromJsonNode,
  "repository": createRepoDescFromJsonNode
};

export function extractPackageDependenciesFromJson(
  json: string,
  includePropNames: Array<string>
): Array<PackageDescriptor> {
  const jsonErrors: Array<JsonC.ParseError> = [];
  const rootNode = JsonC.parseTree(json, jsonErrors);

  const hasErrors = jsonErrors.length > 0;
  if (!rootNode || hasErrors) return [];

  const hasChildren = rootNode.children && rootNode.children.length > 0;
  if (hasChildren === false) return [];

  return extractDependenciesFromNodes(rootNode, includePropNames);
}

function extractDependenciesFromNodes(
  rootNode: JsonC.Node,
  includePropNames: string[]
): Array<PackageDescriptor> {
  const matchedDependencies: Array<PackageDescriptor> = [];

  for (const incPropName of includePropNames) {
    const node = findNodesAtLocation(rootNode, incPropName);
    if (!node) continue;

    if (node instanceof Array) {
      const matched = descendChildNodes(node);
      matchedDependencies.push.apply(matchedDependencies, matched);
      continue;
    }

    const hasChildren = node.children && node.children.length > 0;
    if (hasChildren) {
      const matched = descendChildNodes(node.children);
      matchedDependencies.push.apply(matchedDependencies, matched);
      continue;
    }
  }

  return matchedDependencies
}

function descendChildNodes(nodes: Array<JsonC.Node>): Array<PackageDescriptor> {
  const matchedDependencies: Array<PackageDescriptor> = [];

  for (const node of nodes) {
    if (!node.children || node.children.length === 0) continue;

    const [keyNode, valueNode] = node.children;

    // parse string properties
    if (valueNode.type == "string") {

      // create the package descriptor
      const packageDesc = createPackageDescFromJsonNode(keyNode)

      // add the version type to the package desc
      const versionDesc = createVersionDescFromJsonNode(valueNode);
      packageDesc.addType(versionDesc);

      // add the package desc to the matched array
      matchedDependencies.push(packageDesc);

      continue;
    }

    // parse complex properties
    if (valueNode.type == "object") {

      // create the package descriptor
      const packageDesc = createPackageDescFromJsonNode(keyNode);

      for (const typeName in complexTypeHandlers) {

        const typeNode = JsonC.findNodeAtLocation(valueNode, [typeName]);

        if (typeNode) {
          // get the type desc
          const handler = complexTypeHandlers[typeName];

          // add the handled type to the package desc
          const typeDesc = handler(typeNode);

          // skip types that are't fully defined
          if (!typeDesc) continue;

          packageDesc.addType(typeDesc);
        }
      }

      // skip when no types were added
      if (packageDesc.typeCount === 0) continue;

      // add the package desc to the matched array
      matchedDependencies.push(packageDesc);
    }

  }

  return matchedDependencies;
}

function findNodesAtLocation(
  jsonTree: JsonC.Node,
  expression: string
): Undefinable<JsonC.Node | Array<JsonC.Node>> {
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

  if (!nodeUntilDotStar) return undefined;

  if (!nodeUntilDotStar.children || nodeUntilDotStar.children.length === 0) {
    return undefined;
  }

  // filter the childrens children where the value type is "object"
  // @ts-ignore
  return nodeUntilDotStar.children
    .filter(x => x.children && x.children.length === 2)
    .flat()
    .filter(x => x.children && x.children[1].type === "object")
    .flatMap(x => x.children && x.children[1].children);
}