import {
  TPackageDescriptor,
  TPackageGitDescriptor,
  TPackageHostedDescriptor,
  TPackagePathDescriptor,
  TPackageVersionDescriptor
} from "domain/packages";
import { YAMLMap } from 'yaml';
import { findPair } from 'yaml/util';

export function createPackageDesc(keyNode: any): TPackageDescriptor {
  const nameRange = {
    start: keyNode.range[0],
    end: keyNode.range[0],
  };

  return {
    name: keyNode.value,
    nameRange,
    types: []
  };
}

export function createVersionDesc(
  parentKeyNode: any,
  valueNode: any,
  isQuoteType: boolean
): TPackageVersionDescriptor {

  const isComplexNode = !!parentKeyNode;

  const versionRange = {
    start: valueNode.range[0],
    end: isComplexNode
      ? valueNode.range[2] - 1
      : valueNode.range[1],
  };

  // +1 and -1 to be inside quotes
  if (isQuoteType) {
    versionRange.start++;
    versionRange.end--;
  }

  return {
    type: "version",
    version: valueNode.value || "",
    versionRange
  }
}

export function createPathDesc(
  parentKeyNode: any,
  valueNode: any,
  isQuoteType: boolean
): TPackagePathDescriptor {

  const pathRange = {
    start: valueNode.range[0],
    end: valueNode.range[1],
  };

  if (isQuoteType) {
    pathRange.start++;
    pathRange.end--;
  }

  const pathDesc: TPackagePathDescriptor = {
    type: "path",
    path: valueNode.value,
    pathRange
  }

  return pathDesc;
}

export function createHostedDesc(
  parentKeyNode: any,
  valueNode: any,
  isQuoteType: boolean
): TPackageHostedDescriptor {

  const map = valueNode as YAMLMap;
  let hostName = "";
  let hostUrl = "";

  // skip incomplete hosted entries
  if (map.has("url") === false) return;

  // extract the host url
  const namePair = findPair(map.items, "url");
  hostUrl = (<any>namePair.value).value;

  // extract alias package name
  if (map.has("name")) {
    const namePair = findPair(map.items, "name");
    hostName = (<any>namePair.value).value;
  }

  return {
    type: "hosted",
    hostName,
    hostUrl
  }
}

export function createGitDesc(
  parentKeyNode: any,
  valueNode: any,
  isQuoteType: boolean
): TPackageGitDescriptor {

  let gitUrl = "";
  let gitRef = "";
  let gitPath = "";

  // extract url from direct strings
  const isStringType = valueNode.type === "PLAIN" || isQuoteType;
  if (isStringType) {
    gitUrl = valueNode.value;
    return {
      type: "git",
      gitUrl,
      gitRef,
      gitPath
    }
  }

  const map = valueNode as YAMLMap;

  // skip incomplete git entries
  if (map.has("url") === false) return;

  // extract the git url
  const namePair = findPair(map.items, "url");
  gitUrl = (<any>namePair.value).value;

  // extract refs
  if (map.has("ref")) {
    const namePair = findPair(map.items, "ref");
    gitRef = (<any>namePair.value).value;
  }

  // extract paths
  if (map.has("path")) {
    const namePair = findPair(map.items, "path");
    gitPath = (<any>namePair.value).value;
  }

  return {
    type: "git",
    gitUrl,
    gitRef,
    gitPath
  }
}