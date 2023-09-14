export default {

  "createDependenciesFromXml": {

    test: `
      <Project>
        <Sdk Name="Microsoft.Build.CentralPackageVersions" Version="2.1.3" />
        <ItemGroup>
            <PackageReference Include="Microsoft.Extensions.DependencyInjection.Abstractions" Version="2.0.0" />
            <PackageReference Include="Microsoft.Extensions.Logging.Abstractions" Version="2.0.1" />
            <PackageVersion Include="System.Text.Json" Version="4.7.2" />
            <PackageVersion Include="Microsoft.Extensions.Options" VersionOverride="1.2.3" />
            <DotNetCliToolReference Include="Microsoft.EntityFrameworkCore.Tools" Version="6.0.7" />
            <GlobalPackageReference Include="Microsoft.Azure.ServiceBus" Version="(3.0,)" />
            <PackageVersion Update="AngularJS.Core" Version="1.0.*" />
        </ItemGroup>
      </Project>
    `,

    expected: [
      {
        "types": {
          "name": {
            "type": "name",
            "name": "Microsoft.Build.CentralPackageVersions",
            "nameRange": {
              "start": 25,
              "end": 25
            }
          },
          "version": {
            "type": "version",
            "version": "2.1.3",
            "versionRange": {
              "start": 85,
              "end": 90
            }
          }
        },
        "typeCount": 2
      },
      {
        "types": {
          "name": {
            "type": "name",
            "name": "Microsoft.Azure.ServiceBus",
            "nameRange": {
              "start": 610,
              "end": 610
            }
          },
          "version": {
            "type": "version",
            "version": "(3.0,)",
            "versionRange": {
              "start": 680,
              "end": 686
            }
          }
        },
        "typeCount": 2
      },
      {
        "types": {
          "name": {
            "type": "name",
            "name": "Microsoft.Extensions.DependencyInjection.Abstractions",
            "nameRange": {
              "start": 127,
              "end": 127
            }
          },
          "version": {
            "type": "version",
            "version": "2.0.0",
            "versionRange": {
              "start": 218,
              "end": 223
            }
          }
        },
        "typeCount": 2
      },
      {
        "types": {
          "name": {
            "type": "name",
            "name": "Microsoft.Extensions.Logging.Abstractions",
            "nameRange": {
              "start": 240,
              "end": 240
            }
          },
          "version": {
            "type": "version",
            "version": "2.0.1",
            "versionRange": {
              "start": 319,
              "end": 324
            }
          }
        },
        "typeCount": 2
      },
      {
        "types": {
          "name": {
            "type": "name",
            "name": "System.Text.Json",
            "nameRange": {
              "start": 341,
              "end": 341
            }
          },
          "version": {
            "type": "version",
            "version": "4.7.2",
            "versionRange": {
              "start": 393,
              "end": 398
            }
          }
        },
        "typeCount": 2
      },
      {
        "types": {
          "name": {
            "type": "name",
            "name": "Microsoft.Extensions.Options",
            "nameRange": {
              "start": 415,
              "end": 415
            }
          },
          "version": {
            "type": "version",
            "version": "1.2.3",
            "versionRange": {
              "start": 487,
              "end": 492
            }
          }
        },
        "typeCount": 2
      },
      {
        "types": {
          "name": {
            "type": "name",
            "name": "AngularJS.Core",
            "nameRange": {
              "start": 703,
              "end": 703
            }
          },
          "version": {
            "type": "version",
            "version": "1.0.*",
            "versionRange": {
              "start": 752,
              "end": 757
            }
          }
        },
        "typeCount": 2
      },
      {
        "types": {
          "name": {
            "type": "name",
            "name": "Microsoft.EntityFrameworkCore.Tools",
            "nameRange": {
              "start": 509,
              "end": 509
            }
          },
          "version": {
            "type": "version",
            "version": "6.0.7",
            "versionRange": {
              "start": 588,
              "end": 593
            }
          }
        },
        "typeCount": 2
      }
    ]
  }
}