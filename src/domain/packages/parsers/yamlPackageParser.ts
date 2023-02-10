import { Document, Pair, ParsedNode, parseDocument, YAMLMap } from 'yaml';
import { createPackageResource, TPackageFileLocationDescriptor } from '../index';
import { PackageDependency } from '../models/packageDependency';

export type YamlPath = Array<string | number>;

type YamlOptions = {
  hasCrLf: boolean
}

export function extractPackageDependenciesFromYaml(
  packagePath: string,
  yaml: string,
  includePropNames: Array<string>
): Array<PackageDependency> {

  const yamlDoc = parseDocument(yaml)
  if (!yamlDoc || !yamlDoc.contents || yamlDoc.errors.length > 0) return [];

  const opts: YamlOptions = {
    hasCrLf: yaml.indexOf('\r\n') > 0
  };

  const dependencies = extractDependenciesFromNodes(yamlDoc, includePropNames, opts);

  return dependencies.map(descriptor => new PackageDependency(
    createPackageResource(
      descriptor.name,
      descriptor.version,
      packagePath
    ),
    descriptor.nameRange,
    descriptor.versionRange,
  ));
}

function extractDependenciesFromNodes(
  rootNode: Document.Parsed<ParsedNode>,
  includePropNames: string[],
  opts: YamlOptions
): TPackageFileLocationDescriptor[] {
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
  nodes: Array<Pair>,
  parentNode: Pair,
  includePropName: string
): Array<TPackageFileLocationDescriptor> {
  const matchedDependencies: Array<TPackageFileLocationDescriptor> = [];
  const noIncludePropName = includePropName.length === 0;

  for (const node of <any>nodes) {
    const { key, value } = node as Pair<any, any>;

    const isQuoteType = value.type === "QUOTE_SINGLE"
      || value.type === "QUOTE_DOUBLE";

    const isStringType = value.type === "PLAIN" || isQuoteType;

    if (isStringType && (noIncludePropName || key.value === includePropName)) {

      const dependencyLoc = createDependencyLocFromProperty(
        parentNode,
        key,
        value,
        isQuoteType
      );

      matchedDependencies.push(dependencyLoc);
    } else if (value.items) {

      // recurse child nodes
      const children = descendChildNodes(
        value.items,
        key,
        'version'
      );

      matchedDependencies.push.apply(matchedDependencies, children);
    }
  }

  return matchedDependencies;
}

function createDependencyLocFromProperty(
  parentKeyNode: any,
  keyNode: any,
  valueNode: any,
  isQuoteType: boolean
): TPackageFileLocationDescriptor {

  const isComplexVersion = !!parentKeyNode;

  const node = parentKeyNode || keyNode;

  const nameRange = {
    start: node.range[0],
    end: node.range[0],
  };

  const versionRange = {
    start: valueNode.range[0],
    end: isComplexVersion
      ? valueNode.range[2] - 1
      : valueNode.range[1],
  };

  if (isQuoteType) {
    versionRange.start++;
    versionRange.end--;
  }

  return {
    name: node.value,
    version: valueNode.value || "",
    nameRange,
    versionRange
  } as any;
}