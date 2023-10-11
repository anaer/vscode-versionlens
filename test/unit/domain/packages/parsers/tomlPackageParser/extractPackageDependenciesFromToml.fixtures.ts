import {
  PackageDescriptor,
  PackageDescriptorType,
  TPackageNameDescriptor,
  TPackageTypeDescriptor,
  TPackageVersionDescriptor
} from "domain/packages";
import { KeyDictionary } from "domain/utils";

export default {

  extractDependencyEntries: {

    test: `
      [dependencies]
      serde = "1.0.97"
      indexmap = { version = "1.0", optional = true }

      [dependencies.awesome]
      version = "1.3.5"

      [dev-dependencies]
      serde_derive = "1.0"
      serde_json = "1.0"
    `,
    expected: [
      <PackageDescriptor>{
        typeCount: 2,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          name: <TPackageNameDescriptor>{
            type: PackageDescriptorType.name,
            name: "serde",
            nameRange: {
              start: 28,
              end: 28
            },
          },
          version: <TPackageVersionDescriptor>{
            type: PackageDescriptorType.version,
            version: "1.0.97",
            versionRange: {
              start: 37,
              end: 43
            },
          }
        }
      },
      <PackageDescriptor>{
        typeCount: 2,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          name: <TPackageNameDescriptor>{
            type: PackageDescriptorType.name,
            name: "indexmap",
            nameRange: {
              start: 51,
              end: 51
            },
          },
          version: <TPackageVersionDescriptor>{
            type: PackageDescriptorType.version,
            version: "1.0",
            versionRange: {
              start: 75,
              end: 78
            },
          }
        }
      },
      <PackageDescriptor>{
        typeCount: 2,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          name: <TPackageNameDescriptor>{
            type: PackageDescriptorType.name,
            name: "awesome",
            nameRange: {
              start: 120,
              end: 120
            },
          },
          version: <TPackageVersionDescriptor>{
            type: PackageDescriptorType.version,
            version: "1.3.5",
            versionRange: {
              start: 146,
              end: 151
            },
          }
        }
      },
      <PackageDescriptor>{
        typeCount: 2,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          name: <TPackageNameDescriptor>{
            type: PackageDescriptorType.name,
            name: "serde_derive",
            nameRange: {
              start: 185,
              end: 185
            },
          },
          version: <TPackageVersionDescriptor>{
            type: PackageDescriptorType.version,
            version: "1.0",
            versionRange: {
              start: 201,
              end: 204
            },
          }
        }
      },
      <PackageDescriptor>{
        typeCount: 2,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          name: <TPackageNameDescriptor>{
            type: PackageDescriptorType.name,
            name: "serde_json",
            nameRange: {
              start: 212,
              end: 212
            },
          },
          version: <TPackageVersionDescriptor>{
            type: PackageDescriptorType.version,
            version: "1.0",
            versionRange: {
              start: 226,
              end: 229
            },
          }
        }
      },
    ]
  },

}