import { Nullable } from 'domain/generics';
import {
  PackageDescriptor,
  PackageDescriptorType,
  TPackageDependencyRange,
  TPackageNameDescriptor,
  TPackageVersionDescriptor
} from 'domain/packages';
import xmldoc from 'xmldoc';

export function createDependenciesFromXml(
  xml: string,
  includePropertyNames: Array<string>
): Array<PackageDescriptor> {

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
  topLevelNodes,
  xml: string,
  includePropertyNames: Array<string>
): Array<PackageDescriptor> {
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

  function parseVersionNode(dependencyNode) {
    if (includePropertyNames.includes(dependencyNode.name) == false) {
      return;
    }

    const dependencyLens = createFromAttribute(dependencyNode, xml);
    if (dependencyLens) {
      collector.push(dependencyLens);
    }
  }

  return collector;
}

function createFromAttribute(node, xml: string): PackageDescriptor {
  const nameRange = {
    start: node.startTagPosition,
    end: node.startTagPosition,
  };

  // xmldoc doesn't report attribute ranges so this gets them manually
  let versionRange = null;
  const versionAttrNames = ['VersionOverride', 'Version']
  for (let index = 0; index < versionAttrNames.length; index++) {
    const attrName = versionAttrNames[index];
    versionRange = getAttributeRange(node, ` ${attrName}="`, xml);
    if (versionRange != null) break;
  }

  if (versionRange === null) return null;

  const name = node.attr.Include || node.attr.Update || node.attr.Name;
  const version = node.attr.VersionOverride || node.attr.Version;

  const nameDesc: TPackageNameDescriptor = {
    type: PackageDescriptorType.name,
    name,
    nameRange
  }

  const versionDesc: TPackageVersionDescriptor = {
    type: PackageDescriptorType.version,
    version,
    versionRange
  }

  const packageDesc = new PackageDescriptor();
  packageDesc.addType(nameDesc);
  packageDesc.addType(versionDesc);

  return packageDesc;
}

function getAttributeRange(
  node,
  attributeName: string,
  xml: string
): Nullable<TPackageDependencyRange> {
  const lineText = xml.substring(node.startTagPosition, node.position);

  let start = lineText.indexOf(attributeName);
  if (start === -1) return null;
  start += attributeName.length

  const end = lineText.indexOf('"', start);

  return {
    start: node.startTagPosition + start,
    end: node.startTagPosition + end,
  };
}