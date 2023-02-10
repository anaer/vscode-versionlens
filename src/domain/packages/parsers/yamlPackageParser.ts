import { Document, Pair, ParsedNode, parseDocument, YAMLMap, isMap } from 'yaml';
import { findPair } from 'yaml/util';
import { TPackageLocationDescriptor } from '../index';
import {
  createGitDesc,
  createHostedDesc,
  createPackageDesc,
  createPathDesc,
  createVersionDesc
} from './yaml/yamlPackageTypeFactory';

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
    const isQuoteType = isNodeQuoted(valueNode);
    const isStringType = valueNode.type === "PLAIN" || isQuoteType;

    // parse string properties
    if (isStringType && (noIncludePropName || keyNode.value === includePropName)) {
      const packageDesc = createPackageDesc(keyNode);
      const versionDesc = createVersionDesc(
        parentNode,
        valueNode,
        isQuoteType
      );

      packageDesc.types.push(versionDesc);
      matchedDependencies.push(packageDesc);
      continue;
    }

    // parse complex properties
    if (isMap(valueNode)) {
      const map = valueNode as YAMLMap;
      const packageDesc = createPackageDesc(keyNode);

      for (const typeName in complexTypeHandlers) {
        if (map.has(typeName)) {
          const pair = findPair(map.items, typeName);
          const handler = complexTypeHandlers[typeName];
          const desc = handler(
            keyNode,
            pair.value,
            isNodeQuoted(valueNode)
          );
          packageDesc.types.push(desc);
        }
      }

      if (packageDesc.types.length === 0) continue;

      matchedDependencies.push(packageDesc);
    }

  }

  return matchedDependencies;
}

function isNodeQuoted(node: any) {
  return node.type === "QUOTE_SINGLE"
    || node.type === "QUOTE_DOUBLE";
}