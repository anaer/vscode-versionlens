import { PackageDependency } from "domain/packages";

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
      },

      "scripts": {
        "script1": "run me",
      }
    },

    expected: [
      <PackageDependency>{
        nameRange: {
          start: 17,
          end: 17
        },
        versionRange: {
          start: 29,
          end: 34
        },
        package: {
          path: "testPath",
          name: "Package1",
          version: "1.0.0"
        }
      },
      <PackageDependency>{
        nameRange: {
          start: 36,
          end: 36
        },
        versionRange: {
          start: 48,
          end: 80
        },
        package: {
          path: "testPath",
          name: "Package2",
          version: "github:repo/project#semver:1.2.3"
        }
      },
      <PackageDependency>{
        nameRange: {
          start: 82,
          end: 82
        },
        versionRange: {
          start: 94,
          end: 95
        },
        package: {
          path: "testPath",
          name: "Package3",
          version: "*"
        }
      },
      <PackageDependency>{
        nameRange: {
          start: 97,
          end: 97
        },
        versionRange: {
          start: 127,
          end: 132
        },
        package: {
          path: "testPath",
          name: "ComplexPackage1",
          version: "1.2.3"
        }
      },
      <PackageDependency>{
        nameRange: {
          end: 135,
          start: 135
        },
        package: {
          path: "testPath",
          name: "NameOverrides",
          version: "1.0.0"
        },
        versionRange: {
          end: 159,
          start: 154
        }
      }
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
      <PackageDependency>{
        nameRange: {
          start: 32,
          end: 32
        },
        versionRange: {
          start: 49,
          end: 54
        },
        package: {
          path: "testPath",
          name: "childPackage1",
          version: "2.0.0"
        }
      },
      <PackageDependency>{
        nameRange: {
          start: 56,
          end: 56
        },
        versionRange: {
          start: 73,
          end: 78
        },
        package: {
          path: "testPath",
          name: "childPackage2",
          version: "3.0.0"
        }
      },
      <PackageDependency>{
        nameRange: {
          start: 99,
          end: 99
        },
        versionRange: {
          start: 116,
          end: 121
        },
        package: {
          path: "testPath",
          name: "childPackage3",
          version: "4.0.0"
        }
      },
    ]
  }

}