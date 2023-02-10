import { Document, Pair, ParsedNode, parseDocument, YAMLMap, isMap } from 'yaml';
import { findPair } from 'yaml/util';
import { TPackageLocationDescriptor } from '../../index';
import {
  createGitDesc,
  createHostedDesc,
  createPackageDesc,
  createPathDesc,
  createVersionDesc
} from './yamlPackageTypeFactory';

const complexTypeHandlers = {
  "version": createVersionDesc,
  "path": createPathDesc,
  "hosted": createHostedDesc,
  "git": createGitDesc
};

export function extractPackageDependenciesFromYaml(
  yaml: string,
  includePropNames: Array<string>
): Array<TPackageLocationDescriptor> {

  const yamlDoc = parseDocument(yaml)
  if (!yamlDoc || !yamlDoc.contents || yamlDoc.errors.length > 0) return [];

  return extractDependenciesFromNodes(yamlDoc, includePropNames);
}

function extractDependenciesFromNodes(
  rootNode: Document.Parsed<ParsedNode>,
  includePropNames: string[]
): TPackageLocationDescriptor[] {
  const matchedDependencies = [];

  for (const incPropName of includePropNames) {
    const segments = incPropName.split(".");

    const node = rootNode.getIn(segments) as YAMLMap;
    if (!node) continue;

    const children = node instanceof Array
      ? descendChildNodes(node, null, "")
      : descendChildNodes(node.items, null, "");

    matchedDependencies.push.apply(matchedDependencies, children);
  }

  return matchedDependencies
}

function descendChildNodes(
  pairs: Array<Pair<any, any>>,
  parentNode: Pair<any, any>,
  includePropName: string
): Array<TPackageLocationDescriptor> {
  const matchedDependencies: Array<TPackageLocationDescriptor> = [];
  const noIncludePropName = includePropName.length === 0;

  for (const pair of pairs) {
    const { key: keyNode, value: valueNode } = pair;
    const isQuotedType = isNodeQuoted(valueNode);
    const isStringType = valueNode.type === "PLAIN" || isQuotedType;

    // parse string properties
    if (isStringType && (noIncludePropName || keyNode.value === includePropName)) {

      // create the package descriptor
      const packageDesc = createPackageDesc(keyNode);

      // add the version type to the package desc
      const versionDesc = createVersionDesc(
        parentNode,
        valueNode,
        isQuotedType
      );
      packageDesc.types.push(versionDesc);

      // add the package desc to the matched array
      matchedDependencies.push(packageDesc);

      continue;
    }

    // parse complex properties
    if (isMap(valueNode)) {
      const map = valueNode as YAMLMap;
      const isQuotedType = isNodeQuoted(valueNode);

      // create the package descriptor
      const packageDesc = createPackageDesc(keyNode);

      for (const typeName in complexTypeHandlers) {
        if (map.has(typeName)) {
          const pair = findPair(map.items, typeName);

          // get the type desc
          const handler = complexTypeHandlers[typeName];

          // skip types that are't fully defined
          if(!handler) continue;

          // add the handled type to the package desc
          const desc = handler(
            keyNode,
            pair.value,
            isQuotedType
          );
          packageDesc.types.push(desc);
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

function isNodeQuoted(node: any) {
  return node.type === "QUOTE_SINGLE"
    || node.type === "QUOTE_DOUBLE";
}