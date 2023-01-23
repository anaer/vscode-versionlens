import assert from 'assert';

import { createDependenciesFromXml } from 'infrastructure/providers/dotnet';

import Fixtures from './createDependenciesFromXml.fixtures';

export const createDependenciesFromXmlTests = {

  title: createDependenciesFromXml.name,

  'returns empty when no matches found with "$1"': [
    [[], ''],
    [["non-dependencies"], Fixtures.createDependenciesFromXml.test],
    function (testIncludeNames: Array<string>, expected: string)  {
      this.test.title = this.test.title.replace("$1", testIncludeNames);
      const results = createDependenciesFromXml(expected, testIncludeNames);
      assert.equal(results.length, 0);
    }
  ],

  "extracts dependency entries from dotnet xml": () => {
    const includeNames = ["Sdk", "PackageReference", "PackageVersion"]
    const results = createDependenciesFromXml(
      Fixtures.createDependenciesFromXml.test,
      includeNames
    );
    assert.deepEqual(results, Fixtures.createDependenciesFromXml.expected);
  }

}