import {
  PackageDescriptor,
  TPackageGitDescriptor,
  TPackagePathDescriptor,
  TPackageVersionDescriptor
} from "domain/packages";
import * as JsonC from 'jsonc-parser';
import { PackageDescriptorType } from "../definitions/ePackageDescriptorType";

export function createPackageDescFromJsonNode(
  keyNode: JsonC.Node
): PackageDescriptor {
  const nameRange = {
    start: keyNode.offset,
    end: keyNode.offset,
  };

  return new PackageDescriptor(keyNode.value, nameRange);
}

export function createVersionDescFromJsonNode(
  valueNode: any
): TPackageVersionDescriptor {

  // +1 and -1 to be inside quotes
  const versionRange = {
    start: valueNode.offset + 1,
    end: valueNode.offset + valueNode.length - 1,
  };

  return {
    type: PackageDescriptorType.version,
    version: valueNode.value,
    versionRange
  }
}

export function createPathDescFromJsonNode(
  valueNode: any
): TPackagePathDescriptor {

  // +1 and -1 to be inside quotes
  const pathRange = {
    start: valueNode.offset + 1,
    end: valueNode.offset + valueNode.length - 1,
  };

  return {
    type: PackageDescriptorType.path,
    path: valueNode.value,
    pathRange: pathRange
  }
}

export function createRepoDescFromJsonNode(
  valueNode: any
): TPackageGitDescriptor {

  return {
    type: PackageDescriptorType.git,
    gitUrl: valueNode.value,
    gitPath: "",
    gitRef: ""
  }
}