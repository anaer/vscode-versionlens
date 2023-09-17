export const xmlDocFixtures = {

  parse: {
    Nodes: {
      xml: `
        <Project Sdk="Microsoft.NET.Sdk">
          <ItemGroup>
            <CustomElement Include="System.Text.Json" Version="4.7.2" />
            <CustomElement2 Include="A.Package" Version="1.1.1" />
          </ItemGroup>
        </Project>
      `,
      expected: [
        {
          "path": "Project",
          "name": "Project",
          "isSelfClosing": false,
          "tagOpenStart": 9,
          "tagOpenEnd": 42,
          "attributes": {
            "sdk": {
              "name": "Sdk",
              "value": "Microsoft.NET.Sdk",
              "start": 23,
              "end": 40
            }
          },
          "parent": null,
          "text": "\n        ",
          "textStart": 227,
          "textEnd": 236,
          "tagCloseStart": 236,
          "tagCloseEnd": 246
        },
        {
          "path": "Project.ItemGroup",
          "name": "ItemGroup",
          "isSelfClosing": false,
          "tagOpenStart": 53,
          "tagOpenEnd": 64,
          "attributes": {},
          "parent": {
            "path": "Project",
            "name": "Project",
            "isSelfClosing": false,
            "tagOpenStart": 9,
            "tagOpenEnd": 42,
            "attributes": {
              "sdk": {
                "name": "Sdk",
                "value": "Microsoft.NET.Sdk",
                "start": 23,
                "end": 40
              }
            },
            "parent": null,
            "text": "\n        ",
            "textStart": 227,
            "textEnd": 236,
            "tagCloseStart": 236,
            "tagCloseEnd": 246
          },
          "text": "\n          ",
          "textStart": 204,
          "textEnd": 215,
          "tagCloseStart": 215,
          "tagCloseEnd": 227
        },
        {
          "path": "Project.ItemGroup.CustomElement",
          "name": "CustomElement",
          "isSelfClosing": true,
          "tagOpenStart": 77,
          "tagOpenEnd": 137,
          "attributes": {
            "include": {
              "name": "Include",
              "value": "System.Text.Json",
              "start": 101,
              "end": 117
            },
            "version": {
              "name": "Version",
              "value": "4.7.2",
              "start": 128,
              "end": 133
            }
          },
          "parent": {
            "path": "Project.ItemGroup",
            "name": "ItemGroup",
            "isSelfClosing": false,
            "tagOpenStart": 53,
            "tagOpenEnd": 64,
            "attributes": {},
            "parent": {
              "path": "Project",
              "name": "Project",
              "isSelfClosing": false,
              "tagOpenStart": 9,
              "tagOpenEnd": 42,
              "attributes": {
                "sdk": {
                  "name": "Sdk",
                  "value": "Microsoft.NET.Sdk",
                  "start": 23,
                  "end": 40
                }
              },
              "parent": null,
              "text": "\n        ",
              "textStart": 227,
              "textEnd": 236,
              "tagCloseStart": 236,
              "tagCloseEnd": 246
            },
            "text": "\n          ",
            "textStart": 204,
            "textEnd": 215,
            "tagCloseStart": 215,
            "tagCloseEnd": 227
          },
          "tagCloseStart": 135,
          "tagCloseEnd": 137
        },
        {
          "path": "Project.ItemGroup.CustomElement2",
          "name": "CustomElement2",
          "isSelfClosing": true,
          "tagOpenStart": 150,
          "tagOpenEnd": 204,
          "attributes": {
            "include": {
              "name": "Include",
              "value": "A.Package",
              "start": 175,
              "end": 184
            },
            "version": {
              "name": "Version",
              "value": "1.1.1",
              "start": 195,
              "end": 200
            }
          },
          "parent": {
            "path": "Project.ItemGroup",
            "name": "ItemGroup",
            "isSelfClosing": false,
            "tagOpenStart": 53,
            "tagOpenEnd": 64,
            "attributes": {},
            "parent": {
              "path": "Project",
              "name": "Project",
              "isSelfClosing": false,
              "tagOpenStart": 9,
              "tagOpenEnd": 42,
              "attributes": {
                "sdk": {
                  "name": "Sdk",
                  "value": "Microsoft.NET.Sdk",
                  "start": 23,
                  "end": 40
                }
              },
              "parent": null,
              "text": "\n        ",
              "textStart": 227,
              "textEnd": 236,
              "tagCloseStart": 236,
              "tagCloseEnd": 246
            },
            "text": "\n          ",
            "textStart": 204,
            "textEnd": 215,
            "tagCloseStart": 215,
            "tagCloseEnd": 227
          },
          "tagCloseStart": 202,
          "tagCloseEnd": 204
        }
      ]
    },
    NodeText: {
      xml: `
        <Project Sdk="Microsoft.NET.Sdk">
          <ItemGroup>
            <CustomElement>1.2.3</CustomElement>
          </ItemGroup>
        </Project>
      `,
    },

    AttributeData: {
      xml: `
        <Project Sdk="Microsoft.NET.Sdk">
          <ItemGroup>
            <CustomElement Include="System.Text.Json" Version="4.7.2" />
          </ItemGroup>
        </Project>
      `,
      expected: {
        "include": {
          "name": "Include",
          "value": "System.Text.Json",
          "start": 101,
          "end": 117
        },
        "version": {
          "name": "Version",
          "value": "4.7.2",
          "start": 128,
          "end": 133
        }
      }
    },
  },

  findPaths: {

    NoMatches: {
      xml: `
        <Project Sdk="Microsoft.NET.Sdk">
          <ItemGroup>
            <CustomElement Include="System.Text.Json" Version="4.7.2" />
          </ItemGroup>
        </Project>
      `,
    },

    NodeData: {
      xml: `
        <Project Sdk="Microsoft.NET.Sdk">
          <PropertyGroup>
            <Version>1.2.3</Version>
          </PropertyGroup>
          <ItemGroup>
            <PackageReference Include="Microsoft.NET.Test.Sdk" Version="15.6.2" />
            <PackageReference Include="Microsoft.VisualStudio.Threading.Analyzers" Version="17.7.30">
              <PrivateAssets>all</PrivateAssets>
              <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
            </PackageReference>
          </ItemGroup>
        </Project>
      `
    }
  }
}