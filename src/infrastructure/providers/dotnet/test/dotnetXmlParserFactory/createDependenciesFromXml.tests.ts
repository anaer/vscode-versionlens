import assert from 'assert';
import { createDependenciesFromXml } from 'infrastructure/providers/dotnet';
import { test } from 'mocha-ui-esm';
import Fixtures from './createDependenciesFromXml.fixtures';

export const createDependenciesFromXmlTests = {

  [test.title]: createDependenciesFromXml.name,

  'returns empty when no matches found with "$1"': [
    [[], ''],
    [["non-dependencies"], Fixtures.createDependenciesFromXml.test],
    function (testIncludeNames: Array<string>, expected: string) {
      this.test.title = this.test.title.replace("$1", testIncludeNames);
      const results = createDependenciesFromXml("testPath", expected, testIncludeNames);
      assert.equal(results.length, 0);
    }
  ],

  "extracts dependency entries from dotnet xml": () => {
    const includeNames = ["Sdk", "PackageReference", "PackageVersion"]
    const results = createDependenciesFromXml(
      "testPath",
      Fixtures.createDependenciesFromXml.test,
      includeNames
    );
    assert.deepEqual(results, Fixtures.createDependenciesFromXml.expected);
  }

}