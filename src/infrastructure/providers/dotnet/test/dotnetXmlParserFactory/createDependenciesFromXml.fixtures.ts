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

    "expected": [
      {
        nameRange: {
          end: 13,
          start: 13
        },
        packageInfo: {
          name: 'Microsoft.Build.CentralPackageVersions',
          version: '2.1.3'
        },
        versionRange: {
          end: 78,
          start: 73
        }
      },
      {
        nameRange: {
          end: 103,
          start: 103
        },
        packageInfo: {
          name: 'Microsoft.Extensions.DependencyInjection.Abstractions',
          version: '2.0.0'
        },
        versionRange: {
          end: 199,
          start: 194
        }
      },
      {
        nameRange: {
          end: 210,
          start: 210
        },
        packageInfo: {
          name: 'Microsoft.Extensions.Logging.Abstractions',
          version: '2.0.1'
        },
        versionRange: {
          end: 294,
          start: 289
        }
      },
      {
        "nameRange": {
          "start": 305,
          "end": 305
        },
        "packageInfo": {
          "name": "System.Text.Json",
          "version": "4.7.2"
        },
        "versionRange": {
          "end": 362,
          "start": 357
        }
      }
    ]
  }
}