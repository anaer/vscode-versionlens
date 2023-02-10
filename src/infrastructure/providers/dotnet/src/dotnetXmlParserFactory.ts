import { Nullable } from 'domain/generics';
import {
  TPackageDependencyRange,
  TPackageLocationDescriptor,
  TPackageVersionLocationDescriptor
} from 'domain/packages';
import xmldoc from 'xmldoc';

export function createDependenciesFromXml(
  xml: string,
  includePropertyNames: Array<string>
): Array<TPackageLocationDescriptor> {

  let document = null

  try {
    document = new xmldoc.XmlDocument(xml);
  } catch {
    document = null;
  }

  if (!document) return [];

  return extractPackageLensDataFromNodes(
    document,
    xml,
    includePropertyNames
  );
}

function extractPackageLensDataFromNodes(
  topLevelNodes, xml: string,
  includePropertyNames: Array<string>
): Array<TPackageLocationDescriptor> {
  const collector = [];

  topLevelNodes.eachChild(
    function (node) {
      if (node.name === "ItemGroup" && node.children.length > 0) {
        node.eachChild(parseVersionNode);
      } else if (node.name === "Sdk") {
        parseVersionNode(node);
      }
    }
  )

  function parseVersionNode(itemGroupNode) {
    if (includePropertyNames.includes(itemGroupNode.name) == false) return;
    const dependencyLens = createFromAttribute(itemGroupNode, xml);
    if (dependencyLens) collector.push(dependencyLens);
  }

  return collector;
}

function createFromAttribute(node, xml: string): TPackageLocationDescriptor {
  const nameRange = {
    start: node.startTagPosition,
    end: node.startTagPosition,
  };

  // xmldoc doesn't report attribute ranges so this gets them manually
  const versionRange = getAttributeRange(node, ' version="', xml);
  if (versionRange === null) return null;

  const name = node.attr.Include || node.attr.Update || node.attr.Name;
  const version = node.attr.Version;

  const versionDesc: TPackageVersionLocationDescriptor = {
    type: "version",
    version,
    versionRange
  }

  return {
    name,
    nameRange,
    types: [versionDesc]
  };
}

function getAttributeRange(
  node, attributeName: string, xml: string
): Nullable<TPackageDependencyRange> {
  const lineText = xml.substring(node.startTagPosition, node.position);

  let start = lineText.toLowerCase().indexOf(attributeName);
  if (start === -1) return null;
  start += attributeName.length

  const end = lineText.indexOf('"', start);

  return {
    start: node.startTagPosition + start,
    end: node.startTagPosition + end,
  };
}