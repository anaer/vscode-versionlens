import {
  PackageDescriptorType,
  TPackageNameDescriptor,
  TPackageVersionDescriptor,
  XmlDoc,
  XmlNode
} from "domain/packages";

export function createNameDescFromXmlNodes(
  parentNode: XmlNode,
  nodes: XmlNode[],
  propertyNodes: XmlNode[]
): TPackageNameDescriptor {
  let [groupIdNode] = nodes.filter(x => x.name === "groupId");
  if (!groupIdNode) return undefined;

  let [artifactIdNode] = nodes.filter(x => x.name === "artifactId");
  if (!artifactIdNode) return undefined;

  groupIdNode = nodeOrPropertyNode(groupIdNode, propertyNodes);
  artifactIdNode = nodeOrPropertyNode(artifactIdNode, propertyNodes);

  // use the parent node position for the code lens
  const nameRange = {
    start: parentNode.tagOpenStart,
    end: parentNode.tagOpenStart
  };

  return {
    type: PackageDescriptorType.name,
    name: `${groupIdNode.text}:${artifactIdNode.text}`,
    nameRange
  };
}

export function createVersionDescFromXmlNodes(
  nodes: XmlNode[],
  propertyNodes: XmlNode[]
): TPackageVersionDescriptor {
  let [versionNode] = nodes.filter(x => x.name === "version");
  if (!versionNode) return undefined;

  versionNode = nodeOrPropertyNode(versionNode, propertyNodes);

  const versionRange = {
    start: versionNode.textStart,
    end: versionNode.textEnd,
  };

  const version = versionNode.text;

  return {
    type: PackageDescriptorType.version,
    version,
    versionRange
  }
}

export function extractReposUrlsFromXml(stdout: string): Array<string> {
  const regex = /<\?xml(.+\r?\n?)+\/settings>/gm;
  const xmlString = regex.exec(stdout.toString())[0];
  const doc = new XmlDoc();

  doc.parse(xmlString);

  if (doc.errors.length > 0) return [];

  // extract the local repo
  const [localRepository] = doc.findExactPaths("settings.localRepository");
  const results = [localRepository.text];

  // get all profiles repo urls
  const repositoryUrlNodes = doc.findExactPaths(
    "settings.profiles.profile.repositories.repository.url"
  );
  repositoryUrlNodes.forEach(node => {
    results.push(node.text)
  })

  return results;
}


function nodeOrPropertyNode(node: XmlNode, propertyNodes: XmlNode[]) {
  let propertyNode: XmlNode = null;
  const nodeText = node.text.trim();

  // check if this node is a property
  if (nodeText.startsWith("${") && nodeText.endsWith("}")) {
    // get the property name
    const propertyName = nodeText.substring(2, nodeText.length - 1);
    // find the property node
    [propertyNode] = propertyNodes.filter(x => x.name === propertyName);
  }

  // return the property node otherwise the node
  return propertyNode || node;
}