import {
  TPackageGitLocationDescriptor,
  TPackageLocationDescriptor,
  TPackagePathLocationDescriptor,
  TPackageVersionLocationDescriptor
} from "domain/packages";
import * as JsonC from 'jsonc-parser';

export function createPackageDescFromJsonNode(keyNode: JsonC.Node): TPackageLocationDescriptor {
  const nameRange = {
    start: keyNode.offset,
    end: keyNode.offset,
  };

  return {
    name: keyNode.value,
    nameRange,
    types: []
  };
}

export function createVersionDescFromJsonNode(
  parentKeyNode: any,
  valueNode: any
): TPackageVersionLocationDescriptor {

  // +1 and -1 to be inside quotes
  const versionRange = {
    start: valueNode.offset + 1,
    end: valueNode.offset + valueNode.length - 1,
  };

  return {
    type: "version",
    version: valueNode.value,
    versionRange
  }
}

export function createPathDescFromJsonNode(
  parentKeyNode: any,
  valueNode: any
): TPackagePathLocationDescriptor {

  // +1 and -1 to be inside quotes
  const pathRange = {
    start: valueNode.offset + 1,
    end: valueNode.offset + valueNode.length - 1,
  };

  return {
    type: "path",
    path: valueNode.value,
    pathRange: pathRange
  }
}

export function createRepoDescFromJsonNode(
  parentKeyNode: any,
  valueNode: any
): TPackageGitLocationDescriptor {

  return {
    type: "git",
    gitUrl: valueNode.value,
    gitPath: "",
    gitRef: ""
  }
}