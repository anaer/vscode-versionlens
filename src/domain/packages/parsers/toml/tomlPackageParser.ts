import { AST, parseTOML } from "toml-eslint-parser";
import { TOMLTable } from "toml-eslint-parser/lib/ast";
import { PackageDescriptor } from "../packageDescriptor";
import { TTomlPackageParserOptions } from "./tTomlPackageParserOptions";
import {
  createNameDescFromTomlNode,
  createVersionDescFromTomlComplexNode,
  createVersionDescFromTomlNode
} from "./tomlPackageTypeFactory";

export function parsePackagesToml(
  toml: string,
  options: TTomlPackageParserOptions
): Array<PackageDescriptor> {
  try {
    const rootNode = parseTOML(toml);

    const hasChildren = rootNode.body && rootNode.body.length > 0;
    if (hasChildren === false) return [];

    return parsePackageNodes(rootNode.body[0], options);
  } catch (e) {
    return [];
  }
}

function parsePackageNodes(
  bodyNode: AST.TOMLTopLevelTable,
  options: TTomlPackageParserOptions
): Array<PackageDescriptor> {
  const matchedDependencies: Array<PackageDescriptor> = [];
  const { includePropNames } = options;

  const nodes = bodyNode.body
    .filter(x => x.type === 'TOMLTable')
    .filter((x: AST.TOMLTable) => includePropNames.includes(x.resolvedKey[0] as string))
    .map((x: AST.TOMLTable) => x.body)
    .flat()

  for (const node of nodes) {
    const parent = node.parent as TOMLTable;
    const isNameFromTable = parent.key.keys.length > 1;
    const isComplex = node.value.type === 'TOMLInlineTable';

    if (isComplex === false) {
      const packageDesc = new PackageDescriptor();

      // add the name descriptor
      const nameDesc = createNameDescFromTomlNode(node.key, isNameFromTable);
      packageDesc.addType(nameDesc);

      // add the version descriptor
      const versionDesc = createVersionDescFromTomlNode(node.value as AST.TOMLValue);
      packageDesc.addType(versionDesc);

      // add the parent descriptor
      // const parentDesc = createParentDesc((node.parent as TOMLTable).key.keys[0]);
      // packageDesc.addType(parentDesc);

      matchedDependencies.push(packageDesc);

      continue;
    }

    const complexNode = node.value as AST.TOMLInlineTable;

    for (const cNode of complexNode.body) {

      const versionDesc = createVersionDescFromTomlComplexNode(cNode);
      if (versionDesc) {
        const packageDesc = new PackageDescriptor();

        // add the name descriptor
        const nameDesc = createNameDescFromTomlNode(node.key, false);
        packageDesc.addType(nameDesc)

        // add the version descriptor
        const versionDesc = createVersionDescFromTomlNode(cNode.value as AST.TOMLValue);
        packageDesc.addType(versionDesc);

        matchedDependencies.push(packageDesc);
      }

    }

  }

  return matchedDependencies;
}