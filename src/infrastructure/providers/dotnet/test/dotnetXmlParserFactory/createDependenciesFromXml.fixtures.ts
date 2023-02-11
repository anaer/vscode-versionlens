import {
  TPackageDescriptor,
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
  </ItemGroup>
</Project>
    `,

    expected: [
      <TPackageDescriptor>{
        name: 'Microsoft.Build.CentralPackageVersions',
        nameRange: {
          end: 13,
          start: 13
        },
        types: [
          <TPackageVersionDescriptor>{
            type: "version",
            version: "2.1.3",
            versionRange: {
              end: 78,
              start: 73
            },
          }
        ]
      },
      <TPackageDescriptor>{
        name: 'Microsoft.Extensions.DependencyInjection.Abstractions',
        nameRange: {
          end: 103,
          start: 103
        },
        types: [
          <TPackageVersionDescriptor>{
            type: "version",
            version: "2.0.0",
            versionRange: {
              end: 199,
              start: 194
            },
          }
        ]
      },
      <TPackageDescriptor>{
        name: 'Microsoft.Extensions.Logging.Abstractions',
        nameRange: {
          end: 210,
          start: 210
        },
        types: [
          <TPackageVersionDescriptor>{
            type: "version",
            version: "2.0.1",
            versionRange: {
              end: 294,
              start: 289
            },
          }
        ]
      },
      <TPackageDescriptor>{
        name: "System.Text.Json",
        nameRange: {
          start: 305,
          end: 305
        },
        types: [
          <TPackageVersionDescriptor>{
            type: "version",
            version: "4.7.2",
            versionRange: {
              "end": 362,
              "start": 357
            },
          }
        ]
      }
    ]
  }
}