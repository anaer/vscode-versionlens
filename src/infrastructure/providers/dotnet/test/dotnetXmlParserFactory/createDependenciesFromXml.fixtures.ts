import { KeyDictionary } from 'domain/utils'
import {
  PackageDescriptor,
  PackageDescriptorType,
  TPackageNameDescriptor,
  TPackageTypeDescriptor,
  TPackageVersionDescriptor
} from "domain/packages"

export default {

  "createDependenciesFromXml": {

    "test": `
<Project>
  <Sdk Name="Microsoft.Build.CentralPackageVersions" Version="2.1.3" />
  <ItemGroup>
      <PackageReference Include="Microsoft.Extensions.DependencyInjection.Abstractions" Version="2.0.0" />
      <PackageReference Include="Microsoft.Extensions.Logging.Abstractions" Version="2.0.1" />
      <PackageVersion Include="System.Text.Json" Version="4.7.2" />
      <PackageVersion Include="Microsoft.Extensions.Options" VersionOverride="1.2.3" />
  </ItemGroup>
</Project>
    `,

    expected: [
      <PackageDescriptor>{
        typeCount: 2,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          name: <TPackageNameDescriptor>{
            type: PackageDescriptorType.name,
            name: "Microsoft.Build.CentralPackageVersions",
            nameRange: {
              end: 13,
              start: 13
            },
          },
          version: <TPackageVersionDescriptor>{
            type: PackageDescriptorType.version,
            version: "2.1.3",
            versionRange: {
              end: 78,
              start: 73
            },
          }
        }
      },
      <PackageDescriptor>{
        typeCount: 2,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          name: <TPackageNameDescriptor>{
            type: PackageDescriptorType.name,
            name: "Microsoft.Extensions.DependencyInjection.Abstractions",
            nameRange: {
              end: 103,
              start: 103
            },
          },
          version: <TPackageVersionDescriptor>{
            type: PackageDescriptorType.version,
            version: "2.0.0",
            versionRange: {
              end: 199,
              start: 194
            },
          }
        }
      },
      <PackageDescriptor>{
        typeCount: 2,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          name: <TPackageNameDescriptor>{
            type: PackageDescriptorType.name,
            name: "Microsoft.Extensions.Logging.Abstractions",
            nameRange: {
              end: 210,
              start: 210
            },
          },
          version: <TPackageVersionDescriptor>{
            type: PackageDescriptorType.version,
            version: "2.0.1",
            versionRange: {
              end: 294,
              start: 289
            },
          }
        }
      },
      <PackageDescriptor>{
        typeCount: 2,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          name: <TPackageNameDescriptor>{
            type: PackageDescriptorType.name,
            name: "System.Text.Json",
            nameRange: {
              start: 305,
              end: 305
            },
          },
          version: <TPackageVersionDescriptor>{
            type: PackageDescriptorType.version,
            version: "4.7.2",
            versionRange: {
              "end": 362,
              "start": 357
            },
          }
        }
      },
      <PackageDescriptor>{
        typeCount: 2,
        types: <KeyDictionary<TPackageTypeDescriptor>>{
          name: <TPackageNameDescriptor>{
            type: PackageDescriptorType.name,
            name: "Microsoft.Extensions.Options",
            nameRange: {
              start: 373,
              end: 373
            },
          },
          version: <TPackageVersionDescriptor>{
            type: PackageDescriptorType.version,
            version: "1.2.3",
            versionRange: {
              "end": 450,
              "start": 445
            },
          }
        }
      }
    ]
  }
}