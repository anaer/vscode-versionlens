import {
  TPackageDescriptor,
  TPackageGitDescriptor,
  TPackageHostedDescriptor,
  TPackagePathDescriptor,
  TPackageVersionDescriptor
} from "domain/packages";

export default {

  "extractDependencyEntries": {

    "test": `
name: newtify
version: 1.2.3
description: >-
  Have you been turned into a newt?  Would you like to be?
  This package can help. It has all of the
  newt-transmogrification functionality you have been looking
  for.
homepage: https://example-pet-store.com/newtify
documentation: https://example-pet-store.com/newtify/docs
environment:
  sdk: '>=2.0.0 <3.0.0'
dependencies:
  efts: ^2.0.4
  http: # blank with comments
  transmogrify:
    version: ^0.4.0 # complex version with comments
  test: '>=0.5.0 <0.12.0'
  collection: "^1.1.0"
  pathify:
    path: ./some/test/path
  hostify:
    version: 1.0.0
    hosted:
      name: testHostPackageAlias
      url: https://some-package-server.com
  gitify1: 
    git: git@github.com:munificent/kittens.git
  gitify2: 
    git: 
      url: git@github.com:munificent/dogs.git
      ref: some-branch
  gitify3: 
    git: 
      url: git@github.com:munificent/birds.git
      path: path/to/birds
`,

    expected: [
      <TPackageDescriptor>{
        name: "efts",
        nameRange: {
          start: 376,
          end: 376
        },
        types: [
          <TPackageVersionDescriptor>{
            type: "version",
            version: "^2.0.4",
            versionRange: {
              start: 382,
              end: 388
            },
          }
        ]
      },
      <TPackageDescriptor>{
        name: "http",
        nameRange: {
          start: 391,
          end: 391
        },
        types: [
          <TPackageVersionDescriptor>{
            type: "version",
            version: "",
            versionRange: {
              start: 397,
              end: 397
            },
          }
        ]
      },
      <TPackageDescriptor>{
        name: "transmogrify",
        nameRange: {
          start: 421,
          end: 421
        },
        types: [
          <TPackageVersionDescriptor>{
            type: "version",
            version: "^0.4.0",
            versionRange: {
              start: 448,
              end: 486
            },
          }
        ]
      },
      <TPackageDescriptor>{
        name: "test",
        nameRange: {
          start: 489,
          end: 489
        },
        types: [
          <TPackageVersionDescriptor>{
            type: "version",
            version: ">=0.5.0 <0.12.0",
            versionRange: {
              start: 496,
              end: 511
            },
          }
        ]
      },
      <TPackageDescriptor>{
        name: "collection",
        nameRange: {
          start: 515,
          end: 515
        },
        types: [
          <TPackageVersionDescriptor>{
            type: "version",
            version: "^1.1.0",
            versionRange: {
              start: 528,
              end: 534
            },
          }
        ]
      },
      <TPackageDescriptor>{
        name: "pathify",
        nameRange: {
          start: 538,
          end: 538
        },
        types: [
          <TPackagePathDescriptor>{
            type: "path",
            path: "./some/test/path",
            pathRange: {
              start: 557,
              end: 573
            },
          }
        ]
      },
      <TPackageDescriptor>{
        name: "hostify",
        nameRange: {
          start: 576,
          end: 576
        },
        types: [
          <TPackageVersionDescriptor>{
            type: "version",
            version: "1.0.0",
            versionRange: {
              start: 598,
              end: 603
            },
          },
          <TPackageHostedDescriptor>{
            type: "hosted",
            hostName: "testHostPackageAlias",
            hostUrl: "https://some-package-server.com",
          }
        ]
      },
      <TPackageDescriptor>{
        name: "gitify1",
        nameRange: {
          start: 694,
          end: 694
        },
        types: [
          <TPackageGitDescriptor>{
            type: "git",
            gitUrl: "git@github.com:munificent/kittens.git",
            gitRef: "",
            gitPath: "",
          }
        ]
      },
      <TPackageDescriptor>{
        name: "gitify2",
        nameRange: {
          start: 753,
          end: 753
        },
        types: [
          <TPackageGitDescriptor>{
            type: "git",
            gitUrl: "git@github.com:munificent/dogs.git",
            gitRef: "some-branch",
            gitPath: "",
          }
        ]
      },
      <TPackageDescriptor>{
        name: "gitify3",
        nameRange: {
          start: 844,
          end: 844
        },
        types: [
          <TPackageGitDescriptor>{
            type: "git",
            gitUrl: "git@github.com:munificent/birds.git",
            gitPath: "path/to/birds",
            gitRef: "",
          }
        ]
      }
    ]

  }

}