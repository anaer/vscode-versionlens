import { KeyDictionary } from "domain/generics";
import {
  PackageDescriptor,
  TPackageGitDescriptor,
  TPackagePathDescriptor,
  TPackageTypeDescriptor,
  TPackageVersionDescriptor
} from "domain/packages";

export default {

  extractDependencyEntries: {

    test: {
      "dependencies": {
        "Package1": "1.0.0",
        "Package2": "github:repo/project#semver:1.2.3",
        "Package3": "*",
        "ComplexPackage1": {
          "version": "1.2.3"
        },
        "NameOverrides@1": "1.0.0",
        "PathPackage1": {
          "path": "some/path/project"
        },
        "GitPackage1": {
          "repository": "git@github.com:munificent/kittens.git"
        },
      },
      "scripts": {
        "script1": "run me",
      }
    },

    expected: [
      <PackageDescriptor>{
        name: "Package1",
        nameRange: {
          start: 17,
          end: 17
        },
        typeCount: 1,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          version: <TPackageVersionDescriptor>{
            type: "version",
            version: "1.0.0",
            versionRange: {
              start: 29,
              end: 34
            },
          }
        }
      },
      <PackageDescriptor>{
        name: "Package2",
        nameRange: {
          start: 36,
          end: 36
        },
        typeCount: 1,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          version: <TPackageVersionDescriptor>{
            type: "version",
            version: "github:repo/project#semver:1.2.3",
            versionRange: {
              start: 48,
              end: 80
            },
          }
        }
      },
      <PackageDescriptor>{
        name: "Package3",
        nameRange: {
          start: 82,
          end: 82
        },
        typeCount: 1,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          version: <TPackageVersionDescriptor>{
            type: "version",
            version: "*",
            versionRange: {
              start: 94,
              end: 95
            },
          }
        },
      },
      <PackageDescriptor>{
        name: "ComplexPackage1",
        nameRange: {
          start: 97,
          end: 97
        },
        typeCount: 1,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          version: <TPackageVersionDescriptor>{
            type: "version",
            version: "1.2.3",
            versionRange: {
              start: 127,
              end: 132
            },
          }
        },
      },
      <PackageDescriptor>{
        name: "NameOverrides@1",
        nameRange: {
          end: 135,
          start: 135
        },
        typeCount: 1,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          version: <TPackageVersionDescriptor>{
            type: "version",
            version: "1.0.0",
            versionRange: {
              end: 159,
              start: 154
            },
          }
        }
      },
      <PackageDescriptor>{
        name: "PathPackage1",
        nameRange: {
          start: 161,
          end: 161
        },
        typeCount: 1,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          path: <TPackagePathDescriptor>{
            type: "path",
            path: "some/path/project",
            pathRange: {
              start: 185,
              end: 202
            },
          }
        },
      },
      <PackageDescriptor>{
        name: "GitPackage1",
        nameRange: {
          start: 205,
          end: 205
        },
        typeCount: 1,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          git: <TPackageGitDescriptor>{
            type: "git",
            gitUrl: "git@github.com:munificent/kittens.git",
            gitRef: "",
            gitPath: ""
          }
        },
      },
    ]

  },

  matchesPathExpressions: {
    test: {
      "overrides": {
        "parentPackage1": {
          "childPackage1": "2.0.0",
          "childPackage2": "3.0.0",
        },
        "parentPackage2": {
          "childPackage3": "4.0.0",
        }
      }
    },
    expected: [
      <PackageDescriptor>{
        name: "childPackage1",
        nameRange: {
          start: 32,
          end: 32
        },
        typeCount: 1,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          version: <TPackageVersionDescriptor>{
            type: "version",
            version: "2.0.0",
            versionRange: {
              start: 49,
              end: 54
            },
          }
        }
      },
      <PackageDescriptor>{
        name: "childPackage2",
        nameRange: {
          start: 56,
          end: 56
        },
        typeCount: 1,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          version: <TPackageVersionDescriptor>{
            type: "version",
            version: "3.0.0",
            versionRange: {
              start: 73,
              end: 78
            },
          }
        }
      },
      <PackageDescriptor>{
        name: "childPackage3",
        nameRange: {
          start: 99,
          end: 99
        },
        typeCount: 1,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          version: <TPackageVersionDescriptor>{
            type: "version",
            version: "4.0.0",
            versionRange: {
              start: 116,
              end: 121
            },
          }
        }
      },
    ]
  }

}