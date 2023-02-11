import { KeyDictionary } from 'domain/generics';
import { Document, isMap, Pair, ParsedNode, parseDocument, YAMLMap } from 'yaml';
import { findPair } from 'yaml/util';
import { PackageDescriptor } from '../../index';
import { TPackageTypeHandler } from '../definitions/tPackageTypeHandler';
import { TYamlPackageParserOptions } from '../definitions/tYamlPackageParserOptions';
import {
  createPackageDescFromYamlNode,
  createVersionDescFromYamlNode
} from './yamlPackageTypeFactory';

export function extractPackageDependenciesFromYaml(
  yaml: string,
  options: TYamlPackageParserOptions
): Array<PackageDescriptor> {

  const yamlDoc = parseDocument(yaml)
  if (!yamlDoc || !yamlDoc.contents || yamlDoc.errors.length > 0) return [];

  return extractDependenciesFromNodes(yamlDoc, options);
}

function extractDependenciesFromNodes(
  rootNode: Document.Parsed<ParsedNode>,
  options: TYamlPackageParserOptions
): PackageDescriptor[] {
  const matchedDependencies = [];
  const { includePropNames, complexTypeHandlers } = options;

  for (const incPropName of includePropNames) {
    const segments = incPropName.split(".");

    const node = rootNode.getIn(segments) as YAMLMap;
    if (!node) continue;

    const children = node instanceof Array
      ? descendChildNodes(node, complexTypeHandlers)
      : descendChildNodes(node.items, complexTypeHandlers);

    matchedDependencies.push.apply(matchedDependencies, children);
  }

  return matchedDependencies
}

function descendChildNodes(
  pairs: Array<Pair<any, any>>,
  complexTypeHandlers: KeyDictionary<TPackageTypeHandler>
): Array<PackageDescriptor> {
  const matchedDependencies: Array<PackageDescriptor> = [];

  for (const pair of pairs) {
    const { key: keyNode, value: valueNode } = pair;
    const isQuotedType = isNodeQuoted(valueNode);
    const isStringType = valueNode.type === "PLAIN" || isQuotedType;

    // parse string properties
    if (isStringType) {

      // create the package descriptor
      const packageDesc = createPackageDescFromYamlNode(keyNode);

      // add the version type to the package desc
      const versionDesc = createVersionDescFromYamlNode(
        valueNode,
        isQuotedType
      );

      packageDesc.addType(versionDesc);

      // add the package desc to the matched array
      matchedDependencies.push(packageDesc);

      continue;
    }

    // parse complex properties
    if (isMap(valueNode)) {
      const map = valueNode as YAMLMap;
      const isQuotedType = isNodeQuoted(valueNode);

      // create the package descriptor
      const packageDesc = createPackageDescFromYamlNode(keyNode);

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

function isNodeQuoted(node: any) {
  return node.type === "QUOTE_SINGLE"
    || node.type === "QUOTE_DOUBLE";
}