import { PackageDescriptor, XmlDoc } from "domain/packages";
import {
  createBlankVersionDescFromXmlAttr,
  createNameDescFromXmlAttr,
  createSdkNameDescFromXmlAttr,
  createVersionDescFromXmlAttr
} from "./dotnetParserTypeFactory";

export function parseDotNetPackagesXml(
  xml: string,
  includePropertyNames: Array<string>
): Array<PackageDescriptor> {
  if (includePropertyNames.length === 0) return [];

  const document = new XmlDoc();
  document.parse(xml)
  if (document.errors.length > 0) return [];

  return parsePackageNodes(document, includePropertyNames);
}

export function parsePackageNodes(
  doc: XmlDoc,
  includePropNames: string[]
): Array<PackageDescriptor> {

  const matchedDependencies: Array<PackageDescriptor> = [];

  const includeNodes = includePropNames.map(n => doc.findExactPaths(n)).flat();

  for (const node of includeNodes) {

    const packageDesc = new PackageDescriptor();

    // get the name descriptor
    const nameDesc = node.name === "Sdk"
      ? createSdkNameDescFromXmlAttr(node)
      : createNameDescFromXmlAttr(node);
    if (!nameDesc) continue;

    // get the version descriptor
    const versionDesc = createVersionDescFromXmlAttr(node)
      || createBlankVersionDescFromXmlAttr(node);

    if (!versionDesc) continue;

    // add the descriptors
    packageDesc.addType(nameDesc);
    packageDesc.addType(versionDesc);

    // add the package desc to the matched array
    matchedDependencies.push(packageDesc);
  }

  return matchedDependencies;
}