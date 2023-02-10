import { Document, Pair, ParsedNode, parseDocument, YAMLMap, isMap } from 'yaml';
import { findPair } from 'yaml/util';
import {
  TPackageGitLocationDescriptor,
  TPackageHostedLocationDescriptor,
  TPackageLocationDescriptor,
  TPackagePathLocationDescriptor,
  TPackageVersionLocationDescriptor
} from '../index';

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

function createPackageDesc(keyNode: any): TPackageLocationDescriptor {
  const nameRange = {
    start: keyNode.range[0],
    end: keyNode.range[0],
  };

  return {
    name: keyNode.value,
    nameRange,
    types: []
  };
}

function createVersionDesc(
  parentKeyNode: any,
  valueNode: any,
  isQuoteType: boolean
): TPackageVersionLocationDescriptor {

  const isComplexNode = !!parentKeyNode;

  const versionRange = {
    start: valueNode.range[0],
    end: isComplexNode
      ? valueNode.range[2] - 1
      : valueNode.range[1],
  };

  if (isQuoteType) {
    versionRange.start++;
    versionRange.end--;
  }

  const versionDesc: TPackageVersionLocationDescriptor = {
    type: "version",
    version: valueNode.value || "",
    versionRange
  }

  return versionDesc;
}

function createPathDesc(
  parentKeyNode: any,
  valueNode: any,
  isQuoteType: boolean
): TPackagePathLocationDescriptor {

  const pathRange = {
    start: valueNode.range[0],
    end: valueNode.range[1],
  };

  if (isQuoteType) {
    pathRange.start++;
    pathRange.end--;
  }

  const pathDesc: TPackagePathLocationDescriptor = {
    type: "path",
    path: valueNode.value,
    pathRange
  }

  return pathDesc;
}

function createHostedDesc(
  parentKeyNode: any,
  valueNode: any,
  isQuoteType: boolean
): TPackageHostedLocationDescriptor {

  const map = valueNode as YAMLMap;
  const hasName = map.has("name");
  const hasUrl = map.has("url");

  let hostName = "";
  let hostUrl = "";

  if (hasName) {
    const namePair = findPair(map.items, "name");
    hostName = (<any>namePair.value).value;
  }

  if (hasUrl) {
    const namePair = findPair(map.items, "url");
    hostUrl = (<any>namePair.value).value;
  }

  const hostedDesc: TPackageHostedLocationDescriptor = {
    type: "hosted",
    hostName,
    hostUrl
  }

  return hostedDesc;
}

function createGitDesc(
  parentKeyNode: any,
  valueNode: any,
  isQuoteType: boolean
): TPackageGitLocationDescriptor {

  let gitUrl = "";
  let gitRef = "";
  let gitPath = "";

  const isStringType = valueNode.type === "PLAIN" || isQuoteType;

  if (isStringType) {
    gitUrl = valueNode.value;
    return {
      type: "git",
      gitUrl,
      gitRef,
      gitPath
    }
  }

  const map = valueNode as YAMLMap;
  const hasUrl = map.has("url");
  const hasRef = map.has("ref");
  const hasPath = map.has("path");

  if (hasUrl) {
    const namePair = findPair(map.items, "url");
    gitUrl = (<any>namePair.value).value;
  }

  if (hasRef) {
    const namePair = findPair(map.items, "ref");
    gitRef = (<any>namePair.value).value;
  }

  if (hasPath) {
    const namePair = findPair(map.items, "path");
    gitPath = (<any>namePair.value).value;
  }

  return {
    type: "git",
    gitUrl,
    gitRef,
    gitPath
  }
}


function isNodeQuoted(node: any) {
  return node.type === "QUOTE_SINGLE"
    || node.type === "QUOTE_DOUBLE";
}