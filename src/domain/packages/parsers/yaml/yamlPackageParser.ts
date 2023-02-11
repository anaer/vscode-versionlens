import { Document, isMap, Pair, ParsedNode, parseDocument, YAMLMap } from 'yaml';
import { findPair } from 'yaml/util';
import { PackageDescriptor } from '../../index';
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
): Array<PackageDescriptor> {

  const yamlDoc = parseDocument(yaml)
  if (!yamlDoc || !yamlDoc.contents || yamlDoc.errors.length > 0) return [];

  return extractDependenciesFromNodes(yamlDoc, includePropNames);
}

function extractDependenciesFromNodes(
  rootNode: Document.Parsed<ParsedNode>,
  includePropNames: string[]
): PackageDescriptor[] {
  const matchedDependencies = [];

  for (const incPropName of includePropNames) {
    const segments = incPropName.split(".");

    const node = rootNode.getIn(segments) as YAMLMap;
    if (!node) continue;

    const children = node instanceof Array
      ? descendChildNodes(node)
      : descendChildNodes(node.items);

    matchedDependencies.push.apply(matchedDependencies, children);
  }

  return matchedDependencies
}

function descendChildNodes(pairs: Array<Pair<any, any>>): Array<PackageDescriptor> {
  const matchedDependencies: Array<PackageDescriptor> = [];

  for (const pair of pairs) {
    const { key: keyNode, value: valueNode } = pair;
    const isQuotedType = isNodeQuoted(valueNode);
    const isStringType = valueNode.type === "PLAIN" || isQuotedType;

    // parse string properties
    if (isStringType) {

      // create the package descriptor
      const packageDesc = createPackageDesc(keyNode);

      // add the version type to the package desc
      const versionDesc = createVersionDesc(
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

          // add the handled type to the package desc
          const typeDesc = handler(
            pair.value,
            isQuotedType
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

function isNodeQuoted(node: any) {
  return node.type === "QUOTE_SINGLE"
    || node.type === "QUOTE_DOUBLE";
}