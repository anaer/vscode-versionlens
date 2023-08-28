import { KeyDictionary, Undefinable } from 'domain/generics';
import { PackageDescriptor } from 'domain/packages';
import * as JsonC from 'jsonc-parser';
import { TJsonPackageParserOptions } from '../definitions/tJsonPackageParserOptions';
import { TJsonPackageTypeHandler } from '../definitions/tJsonPackageTypeHandler';
import {
  createNameDescFromJsonNode,
  createParentDesc,
  createVersionDescFromJsonNode
} from './jsonPackageTypeFactory';

export function extractPackageDependenciesFromJson(
  json: string,
  options: TJsonPackageParserOptions
): Array<PackageDescriptor> {
  const jsonErrors: Array<JsonC.ParseError> = [];
  const rootNode = JsonC.parseTree(json, jsonErrors);

  const hasErrors = jsonErrors.length > 0;
  if (!rootNode || hasErrors) return [];

  const hasChildren = rootNode.children && rootNode.children.length > 0;
  if (hasChildren === false) return [];

  return extractDependenciesFromNodes(rootNode, options);
}

function extractDependenciesFromNodes(
  rootNode: JsonC.Node,
  options: TJsonPackageParserOptions
): Array<PackageDescriptor> {
  const matchedDependencies: Array<PackageDescriptor> = [];
  const { includePropNames, complexTypeHandlers } = options;

  for (const incPropName of includePropNames) {
    const foundAtLocation = findNodesAtLocation(rootNode, incPropName);
    if (!foundAtLocation || !foundAtLocation.node) continue;

    if (foundAtLocation.node instanceof Array) {
      const matched = descendChildNodes(foundAtLocation.path, foundAtLocation.node, complexTypeHandlers);
      matchedDependencies.push.apply(matchedDependencies, matched);
      continue;
    }

    const hasChildren = foundAtLocation.node.children && foundAtLocation.node.children.length > 0;
    if (hasChildren) {
      const matched = descendChildNodes(foundAtLocation.path, foundAtLocation.node.children, complexTypeHandlers);
      matchedDependencies.push.apply(matchedDependencies, matched);
      continue;
    }
  }

  return matchedDependencies
}

function descendChildNodes(
  path: string,
  nodes: Array<JsonC.Node>,
  complexTypeHandlers: KeyDictionary<TJsonPackageTypeHandler>
): Array<PackageDescriptor> {
  const matchedDependencies: Array<PackageDescriptor> = [];

  for (const node of nodes) {
    if (!node.children || node.children.length === 0) continue;

    const [keyNode, valueNode] = node.children;

    // parse string properties
    if (valueNode.type == "string") {
      const packageDesc = new PackageDescriptor();

      // add the name descriptor
      const nameDesc = createNameDescFromJsonNode(keyNode);
      packageDesc.addType(nameDesc)

      // add the version descriptor
      const versionDesc = createVersionDescFromJsonNode(valueNode);
      packageDesc.addType(versionDesc);

      // add the parent descriptor
      const parentDesc = createParentDesc(path);
      packageDesc.addType(parentDesc);

      // add the package desc to the matched array
      matchedDependencies.push(packageDesc);

      continue;
    }

    // parse complex properties
    if (valueNode.type == "object") {

      const packageDesc = new PackageDescriptor();

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

      // add the name descriptor
      const nameDesc = createNameDescFromJsonNode(keyNode);
      packageDesc.addType(nameDesc)

      // add the parent path to the package desc
      const parentDesc = createParentDesc(path);
      packageDesc.addType(parentDesc);

      // add the package desc to the matched array
      matchedDependencies.push(packageDesc);
    }

  }

  return matchedDependencies;
}

type FoundNode = {
  path: string,
  node: JsonC.Node | Array<JsonC.Node>
}

function findNodesAtLocation(
  jsonTree: JsonC.Node,
  expression: string
): Undefinable<FoundNode> { //Undefinable<JsonC.Node | Array<JsonC.Node>> {
  const pathSegments: Array<JsonC.Segment> = expression.split(".");

  // if the path doesn't end with * then process a standard path
  if (pathSegments[pathSegments.length - 1] !== "*") {
    return {
      path: expression,
      node: JsonC.findNodeAtLocation(jsonTree, pathSegments)
    }
  }

  // find the node up until the .*
  const segmentsWithoutStar = pathSegments.slice(0, pathSegments.length - 1);
  const nodeUntilDotStar = JsonC.findNodeAtLocation(
    jsonTree,
    segmentsWithoutStar
  );

  if (!nodeUntilDotStar) return;

  if (!nodeUntilDotStar.children || nodeUntilDotStar.children.length === 0) {
    return;
  }

  // filter the childrens children where the value type is "object"
  const deepNode = nodeUntilDotStar.children
    .filter(x => x.children && x.children.length === 2)
    .flat()
    .filter(x => x.children && x.children[1].type === "object")
    .flatMap(x => x.children && x.children[1].children);

  return {
    path: segmentsWithoutStar.join("."),
    node: deepNode
  }
}