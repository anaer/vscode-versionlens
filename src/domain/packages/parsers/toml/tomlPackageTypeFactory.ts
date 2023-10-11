import { AST } from "toml-eslint-parser";
import { PackageDescriptorType } from "../definitions/ePackageDescriptorType";
import {
  TPackageNameDescriptor,
  TPackageParentDescriptor,
  TPackageVersionDescriptor
} from "../definitions/tPackageTypeDescriptors";
import { TOMLTable } from "toml-eslint-parser/lib/ast";

export function createNameDescFromTomlNode(keyNode: AST.TOMLKey, isNameFromTable: boolean): TPackageNameDescriptor {
  const nameNode = isNameFromTable
    ? (keyNode.parent.parent as TOMLTable).key.keys[1] as AST.TOMLBare
    : keyNode.keys[0] as AST.TOMLBare;

  const nameRange = {
    start: nameNode.range[0],
    end: nameNode.range[0],
  };

  return {
    type: PackageDescriptorType.name,
    name: nameNode.name,
    nameRange
  };
}

export function createVersionDescFromTomlNode(
  valueNode: AST.TOMLValue
): TPackageVersionDescriptor {

  const version = valueNode.value as string;

  // +1 and -1 to be inside quotes
  const versionRange = {
    start: valueNode.range[0] + 1,
    end: valueNode.range[1] - 1,
  };

  return {
    type: PackageDescriptorType.version,
    version,
    versionRange
  }
}

export function createParentDesc(path: string): TPackageParentDescriptor {
  return {
    type: PackageDescriptorType.parent,
    path
  }
}

export function createVersionDescFromTomlComplexNode(node: AST.TOMLKeyValue) {
  const fi = node.key.keys.findIndex((x: AST.TOMLBare) => x.name === 'version')
  if (fi > -1) {
    return createVersionDescFromTomlNode(node.value as AST.TOMLValue);
  }
}