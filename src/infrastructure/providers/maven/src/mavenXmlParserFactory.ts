import {
  createPackageResource,
  PackageDependency,
  TPackageFileLocationDescriptor
} from 'domain/packages';
import xmldoc from 'xmldoc';
import { MavenProjectProperty } from "./definitions/mavenProjectProperty";

export function createDependenciesFromXml(
  packagePath: string,
  xml: string,
  includePropertyNames: Array<string>
): Array<PackageDependency> {
  let document = null

  try {
    document = new xmldoc.XmlDocument(xml);
  } catch {
    document = null;
  }

  if (!document) return [];

  const properties = extractPropertiesFromDocument(document);

  const packageDescriptors = extractPackageDescriptorsFromNodes(
    document,
    properties,
    includePropertyNames
  );

  return packageDescriptors.map(descriptor => new PackageDependency(
    createPackageResource(
      descriptor.name,
      descriptor.version,
      packagePath
    ),
    descriptor.nameRange,
    descriptor.versionRange
  ));
}

function extractPackageDescriptorsFromNodes(
  xmlDoc,
  properties: Array<MavenProjectProperty>,
  includePropertyNames: Array<string>
) {
  const collector: Array<TPackageFileLocationDescriptor> = [];

  xmlDoc.eachChild(group => {

    switch (group.name) {
      case "dependencies":
        group.eachChild(childNode => {
          if (!includePropertyNames.includes(childNode.name)) return;
          collectFromChildVersionTag(childNode, properties, collector)
        });
        break;

      case "parent":
        if (!includePropertyNames.includes(group.name)) return;
        collectFromChildVersionTag(group, properties, collector)
        break;

      default:
        break;
    }
  });

  return collector;
}

function collectFromChildVersionTag(
  parentNode,
  properties: Array<MavenProjectProperty>,
  collector: Array<TPackageFileLocationDescriptor>
) {
  parentNode.eachChild(childNode => {
    let versionNode;
    if (childNode.name !== "version") return;

    if (childNode.val.indexOf("$") >= 0) {
      let name = childNode.val.replace(/\$|\{|\}/ig, '')
      versionNode = properties.filter(property => {
        return property.name === name
      })[0]
    } else {
      versionNode = childNode;
    }

    const nameRange = {
      start: parentNode.startTagPosition,
      end: parentNode.startTagPosition,
    };

    const versionRange = {
      start: versionNode.position,
      end: versionNode.position + versionNode.val.length,
    };

    let group = parentNode.childNamed("groupId").val
    let artifact = parentNode.childNamed("artifactId").val

    let match = /\$\{(.*)\}/ig.exec(artifact);
    if (match) {
      let property = properties.filter(property => property.name === match[1]);
      artifact = artifact.replace(/\$\{.*\}/ig, property[0].val)
    }

    const name = group + ":" + artifact;
    const version = versionNode.val;

    collector.push({
      name,
      version,
      nameRange,
      versionRange
    });
  });
}

function extractPropertiesFromDocument(xmlDoc): Array<MavenProjectProperty> {
  let properties: Array<MavenProjectProperty> = [];
  let propertiesCurrentPom = xmlDoc.descendantWithPath("properties");

  propertiesCurrentPom.eachChild(property => {
    properties.push({
      name: property.name,
      val: property.val,
      position: property.position
    })
  });

  return properties;
}

export function extractReposUrlsFromXml(stdout: string): Array<string> {
  const regex = /<\?xml(.+\r?\n?)+\/settings>/gm;
  const xmlString = regex.exec(stdout.toString())[0];
  const xml = new xmldoc.XmlDocument(xmlString);

  const localRepository = xml.descendantWithPath("localRepository");

  const results = [
    localRepository.val
  ];

  let repositoriesXml = xml.descendantWithPath("profiles.profile.repositories")
    .childrenNamed("repository");

  repositoriesXml.forEach(repositoryXml => {
    results.push(repositoryXml.childNamed("url").val)
  })

  return results;
}