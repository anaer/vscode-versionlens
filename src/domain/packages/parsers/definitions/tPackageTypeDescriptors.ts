import { TPackageDependencyRange } from "../../definitions/tPackageDependencyRange";

export type TPackageType = {
  type: string
}

export type TPackageNameDescriptor = TPackageType & {
  name: string,
  nameRange: TPackageDependencyRange;
}

export type TPackageVersionDescriptor = TPackageType & {
  version: string,
  versionRange: TPackageDependencyRange;
}

export type TPackagePathDescriptor = TPackageType & {
  path: string
  pathRange: TPackageDependencyRange;
}

export type TPackageHostedDescriptor = TPackageType & {
  hostPackageName: string
  hostUrl: string
}

export type TPackageGitDescriptor = TPackageType & {
  gitUrl: string
  gitRef: string
  gitPath: string
}

export type TPackageParentDescriptor = TPackageType & {
  path: string
}

export type TPackageTypeDescriptor = TPackageNameDescriptor
  | TPackageVersionDescriptor
  | TPackagePathDescriptor
  | TPackageHostedDescriptor
  | TPackageGitDescriptor
  | TPackageParentDescriptor