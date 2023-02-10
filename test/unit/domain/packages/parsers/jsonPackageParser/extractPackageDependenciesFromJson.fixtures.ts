import {
  TPackageGitLocationDescriptor,
  TPackageLocationDescriptor,
  TPackagePathLocationDescriptor,
  TPackageVersionLocationDescriptor
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
      <TPackageLocationDescriptor>{
        name: "Package1",
        nameRange: {
          start: 17,
          end: 17
        },
        types: [
          <TPackageVersionLocationDescriptor>{
            type: "version",
            version: "1.0.0",
            versionRange: {
              start: 29,
              end: 34
            },
          }
        ]
      },
      <TPackageLocationDescriptor>{
        name: "Package2",
        nameRange: {
          start: 36,
          end: 36
        },
        types: [
          <TPackageVersionLocationDescriptor>{
            type: "version",
            version: "github:repo/project#semver:1.2.3",
            versionRange: {
              start: 48,
              end: 80
            },
          }
        ]
      },
      <TPackageLocationDescriptor>{
        name: "Package3",
        nameRange: {
          start: 82,
          end: 82
        },
        types: [
          <TPackageVersionLocationDescriptor>{
            type: "version",
            version: "*",
            versionRange: {
              start: 94,
              end: 95
            },
          }
        ],
      },
      <TPackageLocationDescriptor>{
        name: "ComplexPackage1",
        nameRange: {
          start: 97,
          end: 97
        },
        types: [
          <TPackageVersionLocationDescriptor>{
            type: "version",
            version: "1.2.3",
            versionRange: {
              start: 127,
              end: 132
            },
          }
        ],
      },
      <TPackageLocationDescriptor>{
        name: "NameOverrides@1",
        nameRange: {
          end: 135,
          start: 135
        },
        types: [
          <TPackageVersionLocationDescriptor>{
            type: "version",
            version: "1.0.0",
            versionRange: {
              end: 159,
              start: 154
            },
          }
        ]
      },
      <TPackageLocationDescriptor>{
        name: "PathPackage1",
        nameRange: {
          start: 161,
          end: 161
        },
        types: [
          <TPackagePathLocationDescriptor>{
            type: "path",
            path: "some/path/project",
            pathRange: {
              start: 185,
              end: 202
            },
          }
        ],
      },
      <TPackageLocationDescriptor>{
        name: "GitPackage1",
        nameRange: {
          start: 205,
          end: 205
        },
        types: [
          <TPackageGitLocationDescriptor>{
            type: "git",
            gitUrl: "git@github.com:munificent/kittens.git",
            gitRef: "",
            gitPath: ""
          }
        ],
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
      <TPackageLocationDescriptor>{
        name: "childPackage1",
        nameRange: {
          start: 32,
          end: 32
        },
        types: [
          <TPackageVersionLocationDescriptor>{
            type: "version",
            version: "2.0.0",
            versionRange: {
              start: 49,
              end: 54
            },
          }
        ]
      },
      <TPackageLocationDescriptor>{
        name: "childPackage2",
        nameRange: {
          start: 56,
          end: 56
        },
        types: [
          <TPackageVersionLocationDescriptor>{
            type: "version",
            version: "3.0.0",
            versionRange: {
              start: 73,
              end: 78
            },
          }
        ]
      },
      <TPackageLocationDescriptor>{
        name: "childPackage3",
        nameRange: {
          start: 99,
          end: 99
        },
        types: [
          <TPackageVersionLocationDescriptor>{
            type: "version",
            version: "4.0.0",
            versionRange: {
              start: 116,
              end: 121
            },
          }
        ]
      },
    ]
  }

}