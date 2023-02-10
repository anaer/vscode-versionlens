import { PackageDependency } from "domain/packages";

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
`,

    expected: [
      <PackageDependency>{
        nameRange: {
          start: 376,
          end: 376
        },
        versionRange: {
          start: 382,
          end: 388
        },
        package: {
          path: "testPath",
          name: "efts",
          version: "^2.0.4"
        }
      },
      <PackageDependency>{
        nameRange: {
          start: 391,
          end: 391
        },
        versionRange: {
          start: 397,
          end: 397
        },
        package: {
          path: "testPath",
          name: "http",
          version: ""
        }
      },
      <PackageDependency>{
        nameRange: {
          start: 421,
          end: 421
        },
        versionRange: {
          start: 448,
          end: 486
        },
        package: {
          path: "testPath",
          name: "transmogrify",
          version: "^0.4.0"
        }
      },
      <PackageDependency>{
        nameRange: {
          start: 489,
          end: 489
        },
        versionRange: {
          start: 496,
          end: 511
        },
        package: {
          path: "testPath",
          name: "test",
          version: ">=0.5.0 <0.12.0"
        }
      },
      <PackageDependency>{
        nameRange: {
          start: 515,
          end: 515
        },
        versionRange: {
          start: 528,
          end: 534
        },
        package: {
          path: "testPath",
          name: "collection",
          version: "^1.1.0"
        }
      }
    ]

  }

}