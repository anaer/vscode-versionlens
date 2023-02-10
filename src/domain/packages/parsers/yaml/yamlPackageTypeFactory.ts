import {
  TPackageGitLocationDescriptor,
  TPackageHostedLocationDescriptor,
  TPackageLocationDescriptor,
  TPackagePathLocationDescriptor,
  TPackageVersionLocationDescriptor
} from "domain/packages";
import { YAMLMap } from 'yaml';
import { findPair } from 'yaml/util';

export function createPackageDesc(keyNode: any): TPackageLocationDescriptor {
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
): TPackageVersionLocationDescriptor {

  const isComplexNode = !!parentKeyNode;

  const versionRange = {
    start: valueNode.range[0],
    end: isComplexNode
      ? valueNode.range[2] - 1
      : valueNode.range[1],
  };

  if (isQuoteType) {
    versionRange.start++;
    versionRange.end--;
  }

  const versionDesc: TPackageVersionLocationDescriptor = {
    type: "version",
    version: valueNode.value || "",
    versionRange
  }

  return versionDesc;
}

export function createPathDesc(
  parentKeyNode: any,
  valueNode: any,
  isQuoteType: boolean
): TPackagePathLocationDescriptor {

  const pathRange = {
    start: valueNode.range[0],
    end: valueNode.range[1],
  };

  if (isQuoteType) {
    pathRange.start++;
    pathRange.end--;
  }

  const pathDesc: TPackagePathLocationDescriptor = {
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
): TPackageHostedLocationDescriptor {

  const map = valueNode as YAMLMap;
  const hasName = map.has("name");
  const hasUrl = map.has("url");

  let hostName = "";
  let hostUrl = "";

  if (hasName) {
    const namePair = findPair(map.items, "name");
    hostName = (<any>namePair.value).value;
  }

  if (hasUrl) {
    const namePair = findPair(map.items, "url");
    hostUrl = (<any>namePair.value).value;
  }

  const hostedDesc: TPackageHostedLocationDescriptor = {
    type: "hosted",
    hostName,
    hostUrl
  }

  return hostedDesc;
}

export function createGitDesc(
  parentKeyNode: any,
  valueNode: any,
  isQuoteType: boolean
): TPackageGitLocationDescriptor {

  let gitUrl = "";
  let gitRef = "";
  let gitPath = "";

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
  const hasUrl = map.has("url");
  const hasRef = map.has("ref");
  const hasPath = map.has("path");

  if (hasUrl) {
    const namePair = findPair(map.items, "url");
    gitUrl = (<any>namePair.value).value;
  }

  if (hasRef) {
    const namePair = findPair(map.items, "ref");
    gitRef = (<any>namePair.value).value;
  }

  if (hasPath) {
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