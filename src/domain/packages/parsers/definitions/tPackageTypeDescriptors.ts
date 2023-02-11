import { TPackageDependencyRange } from "../../definitions/tPackageDependencyRange";

export type TPackageType = {
  type: string
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

export type TPackageTypeDescriptor = TPackageVersionDescriptor
  | TPackagePathDescriptor
  | TPackageHostedDescriptor
  | TPackageGitDescriptor