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

  }

}