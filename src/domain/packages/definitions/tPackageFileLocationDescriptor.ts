import { TPackageDependencyRange } from "./tPackageDependencyRange";

export type TPackageTypeDescriptor = {
  type: string
}

export type TPackageVersionLocationDescriptor = TPackageTypeDescriptor & {
  version: string,
  versionRange: TPackageDependencyRange;
}

export type TPackagePathLocationDescriptor = TPackageTypeDescriptor & {
  path: string
  pathRange: TPackageDependencyRange;
}

export type TPackageHostedLocationDescriptor = TPackageTypeDescriptor & {
  hostName: string
  hostUrl: string
}

export type TPackageGitLocationDescriptor = TPackageTypeDescriptor & {
  gitUrl: string
  gitRef: string
  gitPath: string
}

type TPackageTypeLocationDescriptor = TPackageVersionLocationDescriptor
  | TPackagePathLocationDescriptor
  | TPackageHostedLocationDescriptor
  | TPackageGitLocationDescriptor

export type TPackageLocationDescriptor = {

  name: string,

  nameRange: TPackageDependencyRange;

  types: Array<TPackageTypeLocationDescriptor>;

}