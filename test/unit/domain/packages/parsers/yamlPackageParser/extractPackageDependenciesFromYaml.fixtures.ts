import { KeyDictionary } from "domain/generics";
import {
  PackageDescriptor,
  TPackageGitDescriptor,
  TPackageHostedDescriptor,
  TPackagePathDescriptor,
  TPackageTypeDescriptor,
  TPackageVersionDescriptor
} from "domain/packages";

export default {

  extractDependencyEntries: {

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
`,

    expected: [
      <PackageDescriptor>{
        name: "efts",
        nameRange: {
          start: 376,
          end: 376
        },
        typeCount: 1,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          version: <TPackageVersionDescriptor>{
            type: "version",
            version: "^2.0.4",
            versionRange: {
              start: 382,
              end: 388
            },
          }
        }
      },
      <PackageDescriptor>{
        name: "http",
        nameRange: {
          start: 391,
          end: 391
        },
        typeCount: 1,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          version: <TPackageVersionDescriptor>{
            type: "version",
            version: "",
            versionRange: {
              start: 397,
              end: 397
            },
          }
        }
      },
      <PackageDescriptor>{
        name: "transmogrify",
        nameRange: {
          start: 421,
          end: 421
        },
        typeCount: 1,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          version: <TPackageVersionDescriptor>{
            type: "version",
            version: "^0.4.0",
            versionRange: {
              start: 448,
              end: 454
            },
          }
        }
      },
      <PackageDescriptor>{
        name: "test",
        nameRange: {
          start: 489,
          end: 489
        },
        typeCount: 1,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          version: <TPackageVersionDescriptor>{
            type: "version",
            version: ">=0.5.0 <0.12.0",
            versionRange: {
              start: 496,
              end: 511
            },
          }
        }
      },
      <PackageDescriptor>{
        name: "collection",
        nameRange: {
          start: 515,
          end: 515
        },
        typeCount: 1,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          version: <TPackageVersionDescriptor>{
            type: "version",
            version: "^1.1.0",
            versionRange: {
              start: 528,
              end: 534
            },
          }
        }
      }
    ]

  },

  extractPathDependencies: {

    test: `
dependencies:
  pathify1:
    path: ./some/test/path1
  pathify2:
    path: ./some/test/path2 # test comment
    `,
    expected: [
      <PackageDescriptor>{
        name: "pathify1",
        nameRange: {
          start: 17,
          end: 17
        },
        typeCount: 1,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          path: <TPackagePathDescriptor>{
            type: "path",
            path: "./some/test/path1",
            pathRange: {
              start: 37,
              end: 54
            },
          }
        }
      },
      <PackageDescriptor>{
        name: "pathify2",
        nameRange: {
          start: 57,
          end: 57
        },
        typeCount: 1,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          path: <TPackagePathDescriptor>{
            type: "path",
            path: "./some/test/path2",
            pathRange: {
              start: 77,
              end: 94
            },
          }
        }
      }
    ]
  },

  extractGitDepencdencies: {
    test: `
dependencies:
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
  gitify4: 
    git: git@github.com:munificent/foxes.git # test comment
    `  ,
    expected: [
      <PackageDescriptor>{
        name: "gitify1",
        nameRange: {
          start: 17,
          end: 17
        },
        typeCount: 1,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          git: <TPackageGitDescriptor>{
            type: "git",
            gitUrl: "git@github.com:munificent/kittens.git",
            gitRef: "",
            gitPath: "",
          }
        }
      },
      <PackageDescriptor>{
        name: "gitify2",
        nameRange: {
          start: 76,
          end: 76
        },
        typeCount: 1,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          git: <TPackageGitDescriptor>{
            type: "git",
            gitUrl: "git@github.com:munificent/dogs.git",
            gitRef: "some-branch",
            gitPath: "",
          }
        }
      },
      <PackageDescriptor>{
        name: "gitify3",
        nameRange: {
          start: 167,
          end: 167
        },
        typeCount: 1,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          git: <TPackageGitDescriptor>{
            type: "git",
            gitUrl: "git@github.com:munificent/birds.git",
            gitPath: "path/to/birds",
            gitRef: "",
          }
        }
      },
      <PackageDescriptor>{
        name: "gitify4",
        nameRange: {
          start: 262,
          end: 262
        },
        typeCount: 1,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          git: <TPackageGitDescriptor>{
            type: "git",
            gitUrl: "git@github.com:munificent/foxes.git",
            gitPath: "",
            gitRef: "",
          }
        }
      }
    ]
  },

  extractHostedDependencies: {

    test: `
dependencies:
  hostify1:
    version: 1.0.0
    hosted:  https://some-package-server.com
  hostify2:
    version: 2.0.0 # comments
    hosted:  https://some-package-server.com
  hostify3:
    version: 3.0.0
    hosted:
      name: testHostPackageAlias
      url: https://some-package-server.com
`,
    expected: [
      <PackageDescriptor>{
        name: "hostify1",
        nameRange: {
          start: 17,
          end: 17
        },
        typeCount: 2,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          version: <TPackageVersionDescriptor>{
            type: "version",
            version: "1.0.0",
            versionRange: {
              start: 40,
              end: 45
            },
          },
          hosted: <TPackageHostedDescriptor>{
            type: "hosted",
            hostPackageName: "",
            hostUrl: "https://some-package-server.com",
          }
        }
      },
      <PackageDescriptor>{
        name: "hostify2",
        nameRange: {
          start: 93,
          end: 93
        },
        typeCount: 2,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          version: <TPackageVersionDescriptor>{
            type: "version",
            version: "2.0.0",
            versionRange: {
              start: 116,
              end: 121
            },
          },
          hosted: <TPackageHostedDescriptor>{
            type: "hosted",
            hostPackageName: "",
            hostUrl: "https://some-package-server.com",
          }
        }
      },
      <PackageDescriptor>{
        name: "hostify3",
        nameRange: {
          start: 180,
          end: 180
        },
        typeCount: 2,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          version: <TPackageVersionDescriptor>{
            type: "version",
            version: "3.0.0",
            versionRange: {
              start: 203,
              end: 208
            },
          },
          hosted: <TPackageHostedDescriptor>{
            type: "hosted",
            hostPackageName: "testHostPackageAlias",
            hostUrl: "https://some-package-server.com",
          }
        }
      },
    ]

  }



}