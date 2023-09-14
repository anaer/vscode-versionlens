import assert from 'assert';
import { createDependenciesFromXml } from 'infrastructure/providers/dotnet';
import { test } from 'mocha-ui-esm';
import Fixtures from './createDependenciesFromXml.fixtures';

type TestContext = {
  test: {
    title: string
  }
}

export const createDependenciesFromXmlTests = {

  [test.title]: createDependenciesFromXml.name,

  'returns empty when no matches found with "$1"': [
    [[], ''],
    [["non-dependencies"], Fixtures.createDependenciesFromXml.test],
    function (this: TestContext, testIncludeNames: Array<string>, expected: string) {
      // test
      const actual = createDependenciesFromXml(expected, testIncludeNames);

      //assert
      assert.equal(actual.length, 0);
    }
  ],

  "extracts dependency entries from dotnet xml": () => {
    // setup
    const includeNames = [
      "Project.Sdk",
      "Project.ItemGroup.GlobalPackageReference",
      "Project.ItemGroup.PackageReference",
      "Project.ItemGroup.PackageVersion",
      "Project.ItemGroup.DotNetCliToolReference"
    ];

    // test
    const actual = createDependenciesFromXml(
      Fixtures.createDependenciesFromXml.test,
      includeNames
    );

    // assert
    assert.deepEqual(actual, Fixtures.createDependenciesFromXml.expected);
  }

}